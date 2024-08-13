import { Client, Storage, ID } from "appwrite";
import { constants } from "../config/constants";
export class UploadService {

    private client: Client
    private storage: Storage
    constructor() {
        this.client = new Client();
        this.client.setEndpoint(constants?.appwriteEndPoint || '').setProject(constants?.appwriteProject || '');
        this.storage = new Storage(this.client);
    }

    async uploadFile(file: File) {
        try {
            let resp = await this.storage.createFile(constants?.appwriteBucket || '', ID.unique(), file);
            return resp.$id;
        } catch (error) {
            console.log(error)
            return "error"
        }
    }

    async deleteFile(file: string) {
        let resp = await this.storage.deleteFile(constants?.appwriteBucket || '', file);
        return resp;
    }

    async getFilePriew(file: string) {
        let resp = this.storage.getFilePreview(constants?.appwriteBucket || '', file)
        return resp
    }
}