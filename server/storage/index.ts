import { IStorage } from "./IStorage";
import { DatabaseStorage } from "./DatabaseStorage";

// Export the database storage as the default storage implementation
export const storage: IStorage = new DatabaseStorage();