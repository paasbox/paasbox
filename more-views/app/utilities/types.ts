export type Stack = {
    id: string,
    name: string
}

export type APIStacks = {
    stacks: Array<APIStack>
}

export type APIStack = {
    id: string,
    name: string,
    is_started: boolean,
    stack_url: string,
    tasks_url: string
}

export type Task = {
    id: string,
    name: string,
    is_started: boolean,
    is_service: boolean,
    ports: Array<number>,
    instances: number,
    driver: string,
    current_instances?: Array<string>
}

export type APITasks = {
    tasks: Array<APITask>
}

export type APITask = {
    id: string,
    name: string,
    is_started: boolean,
    is_service: boolean,
    ports: Array<number>,
    current_instances: Array<Instance>,
    dev_mode: boolean,
    instances: number,
    driver: string,
    env: Array<string>,
    image?: string
}

export type Instance = {
    id: string,
    url: string
}