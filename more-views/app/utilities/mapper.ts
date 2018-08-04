import { Stack, APIStack } from "./types";

export default class Mapper {
    static stackResponse(response: APIStack): Stack {
        return {
            id: response.id,
            name: response.name
        }
    }
}