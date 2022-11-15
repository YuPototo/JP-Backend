import { Schema, model } from 'mongoose'
import { SchemaNames } from './schemaNames'

const COLLECTION_NAME = 'parameter'

/* interface */
export interface IParameter {
    key: string
    value: unknown
}

const parameterSchema = new Schema<IParameter>(
    {
        key: {
            type: String,
            required: true,
            unique: true,
        },
        value: {
            type: Schema.Types.Mixed,
            required: true,
        },
    },
    { collection: COLLECTION_NAME, timestamps: true },
)

export const Parameter = model<IParameter>(
    SchemaNames.Parameter,
    parameterSchema,
)

export default Parameter
