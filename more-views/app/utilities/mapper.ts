import { Stack, APIStack, Task, APITask, Instance } from "./types";

export default class Mapper {
    
    static stackResponse(response: APIStack): Stack {
        return {
            id: response.id,
            name: response.name
        }
    }

    static taskResponse(response: APITask): Task {
        return {
            id: response.id,
            name: response.name ,
            ports: response.ports || [],
            is_started: response.is_started || false,
            is_service: response.is_service || false,
            instances: response.instances || 0,
            driver: response.driver || "",
            current_instances: response.current_instances ? response.current_instances.map((instance: Instance) => instance.id) : []
        }
    }
}