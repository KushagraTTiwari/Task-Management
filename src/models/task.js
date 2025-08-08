import mongoose from "mongoose";
import { COMPLETED, IN_PROGRESS, PENDING, SUBTASK, USER } from "../constant/enum.js";
const Schema = mongoose.Schema;

const taskSchema = new Schema({
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER,
        required: true
    },
    subtasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: SUBTASK,
        }
    ],
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

taskSchema.set("versionKey", false);

export default mongoose.model("task", taskSchema);
