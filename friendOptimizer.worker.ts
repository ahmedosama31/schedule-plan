import { FriendOptimizationMode, FriendStudentInput, optimizeFriendSchedules } from './friendOptimizer';

export interface FriendOptimizerWorkerRequest {
    student1: FriendStudentInput;
    student2: FriendStudentInput;
    mode: FriendOptimizationMode;
    topN?: number;
}

self.onmessage = (event: MessageEvent<FriendOptimizerWorkerRequest>) => {
    try {
        const { student1, student2, mode, topN } = event.data;
        self.postMessage({ success: true, result: optimizeFriendSchedules(student1, student2, mode, topN) });
    } catch (error) {
        self.postMessage({ success: false, error: error instanceof Error ? error.message : String(error) });
    }
};
