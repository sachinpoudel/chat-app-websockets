import mongoose from "mongoose";
export declare const Message: mongoose.Model<{
    users: string[];
    ts: NativeDate;
    text?: string | null;
    room?: string | null;
    sender?: string | null;
    message?: {
        text?: string | null;
    } | null;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    users: string[];
    ts: NativeDate;
    text?: string | null;
    room?: string | null;
    sender?: string | null;
    message?: {
        text?: string | null;
    } | null;
}, {}, {
    versionKey: false;
}> & {
    users: string[];
    ts: NativeDate;
    text?: string | null;
    room?: string | null;
    sender?: string | null;
    message?: {
        text?: string | null;
    } | null;
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    versionKey: false;
}, {
    users: string[];
    ts: NativeDate;
    text?: string | null;
    room?: string | null;
    sender?: string | null;
    message?: {
        text?: string | null;
    } | null;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    users: string[];
    ts: NativeDate;
    text?: string | null;
    room?: string | null;
    sender?: string | null;
    message?: {
        text?: string | null;
    } | null;
}>, {}, mongoose.ResolveSchemaOptions<{
    versionKey: false;
}>> & mongoose.FlatRecord<{
    users: string[];
    ts: NativeDate;
    text?: string | null;
    room?: string | null;
    sender?: string | null;
    message?: {
        text?: string | null;
    } | null;
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
//# sourceMappingURL=msgSchema.d.ts.map