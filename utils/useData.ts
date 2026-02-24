export const fetchGameList = async () => {
    const path = '/api/games'
    const response = await fetch(path);
    const data = await response.json();
    return data.items;
}

export const fetchEventTypes = async (game: string) => {
    const path = `/api/${game}/event-types`
    const response = await fetch(path);
    const data = await response.json();
    return data.items;
}
