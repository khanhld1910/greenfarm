export interface CustomMessage {
    time: number,
    // time will be used as id
    sender: number,
    //1 is user, 0 is supporter
    content: string
    //message content
}