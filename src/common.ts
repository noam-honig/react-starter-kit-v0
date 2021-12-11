import { JsonDataProvider, Remult } from "remult"

export const remult = new Remult(new JsonDataProvider(localStorage));

