import config from "@/app.config"
import coreApi from "@/providers/core-api"
import { createStore } from "vuex"

export default createStore({
  state: {
    entities: [],
    room: [],
    selectedEntity: null
  },
  getters: {
    getNestedEntities(state) {
      var entitiesByRoom = {}
      state.entities.forEach(el => {
        let name = "Other"
        if (el.room_id && el.room?.name){
          name = el.room_id
        }

        if (!entitiesByRoom[name]){
          entitiesByRoom[name] = {
            id: el.room_id,
            name: el?.room?.name || "Other",
            entities: [] 
          }
        }
        
        entitiesByRoom[name].entities.push(el)
      })
      return entitiesByRoom
    }
  },
  mutations: {
    SET_ENTITIES(state, entities) {
      state.entities = entities
    },
    SET_SINGLE_ENTITIES(state, entity) {
      if (state.entities?.length === 0){
        state.entities = [...entity]
        return
      }
      const prevEntities = JSON.parse(JSON.stringify(state.entities)) // to trigger reactivity
      var foundEntity = prevEntities.find(e => e.id === entity.id)
      console.log(foundEntity)
      if (foundEntity){
        foundEntity = {...foundEntity, value: entity.value, status: entity.status}
        state.entities = prevEntities
      }
    },
    SET_SELECTED_ENTITY(state, entity) {
      state.selectedEntity = entity
    },
  },
  actions: {
    // ENTITIES
    fetchEntities(context){
      return new Promise((resolve, reject) => {
        coreApi.glados.getEntities()
          .then((entities) => {
            context.commit("SET_ENTITIES", entities)
            resolve(entities)
          })
          .catch((error) => {
            console.error(error)
            reject()
          })
      })
    },
    saveEntity(context, data){
      return new Promise((resolve, reject) => {
        coreApi.glados.patchEntities(data.id, { ...data.form }, { "Authorization": config.bearerToken })
          .then((entity) => {
            context.commit("SET_SINGLE_ENTITIES", entity)
            resolve(entity)
          })
          .catch((error) => {
            console.error(error)
            reject()
          })
      })
    },
  },
  modules: {},
})
