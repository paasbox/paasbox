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
    name?: string
}