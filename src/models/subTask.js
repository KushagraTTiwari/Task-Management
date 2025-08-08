import mongoose from "mongoose";
import { COMPLETED, IN_PROGRESS, PENDING, TASK } from "../constant/enum.js";
const Schema = mongoose.Schema;

const subTaskSchema = new Schema({
    subject: {
        type: String,
        required: true,
    },
    deadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: [PENDING, IN_PROGRESS, COMPLETED],
        default: PENDING
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: TASK,
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

subTaskSchema.set("versionKey", false);

export default mongoose.model("subTask", subTaskSchema);
