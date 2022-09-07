import { fetchData } from "../utils";

type DataBaseType = {
    id: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

type TTodoBase = {
    title: string;
    text: string;
    completed: boolean
}

export type TTodo = TTodoBase & DataBaseType;

type TUpdateTodo = Partial<TTodo> & { id: string };
type TDeleteTodo = { id: string };
export default class Todos {
    public static async getAll(): Promise<TTodo[]> {
        return fetchData('/api/todos')
    }

    public static async create(data: TTodoBase): Promise<unknown> {
        console.log(data)
        return fetchData('/api/todos', {
            method: 'post',
            body: data,
        })
    }

    public static async remove(data: TDeleteTodo): Promise<unknown> {
        return fetchData(`/api/todos/${data.id}`, {
            method: 'delete',
        })
    }

    public static async update(data: TUpdateTodo): Promise<unknown> {
        console.log(data);
        return fetchData(`/api/todos/${data.id}`, {
            method: 'PATCH',
            body: {
                completed: data.completed,
            },
        })
    }
}