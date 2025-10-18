interface Scene{
    add: (params: any)=>void
}

export default interface Loader{
    src?: string | undefined;
    texture?: string | undefined;
    model: string | null;
    scene: Scene;
}