import mongoose from "mongoose";
export declare const User: mongoose.Model<{
    name: string;
    joinedAt: NativeDate;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    name: string;
    joinedAt: NativeDate;
}, {}, mongoose.DefaultSchemaOptions> & {
    name: string;
    joinedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    name: string;
    joinedAt: NativeDate;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    name: string;
    joinedAt: NativeDate;
}>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<{
    name: string;
    joinedAt: NativeDate;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=nameSchema.d.ts.map