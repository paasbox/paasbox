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
    healthchecks: Healthcheck[]
    current_instances: Array<string>,
    current_instances_details?: Instance[],
    is_fetching_current_instances_details?: boolean
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
    current_instances: Array<APITaskInstance>,
    dev_mode: boolean,
    instances: number,
    driver: string,
    env: Array<string>,
    image?: string,
    healthchecks: Healthcheck[],
    command: string
}


export type APITaskInstance = {
    id: string,
    url: string
}

export type APIInstances = {
    instances: APIInstance[],
    next_page: string
}

export type APIInstance = {
    id: string,
    stdout: string,
    stdout_url: string,
    stderr: string,
    stderr_url: string,
    pid: number,
    running: boolean,
    driver: string,
    command: string,
    args: string[],
    env: string[],
    pwd: string,
    ports: number[],
    instance_url: string,
    task_url: string,
    stack_url: string
}

export type Healthcheck = {
    frequency: number
    healthy_threshold: number
    instances: HealthcheckInstance[]
    reap_threshold: number
    target: string
    type: string
    unhealthy_threshold: number
}

export type HealthcheckInstance = {
    healthy: boolean
    instance_id: string
    score: number
}

export type Instance = {
    id: string,
    isRunning: boolean,
    environmentVars: string[]
}