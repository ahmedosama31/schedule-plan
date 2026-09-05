import { FriendOptimizationMode, FriendOptimizationResult, FriendStudentInput } from '../friendOptimizer';
import type { FriendOptimizerWorkerRequest } from '../friendOptimizer.worker';

export function runFriendOptimizer(
    student1: FriendStudentInput,
    student2: FriendStudentInput,
    mode: FriendOptimizationMode,
    topN = 5,
): Promise<FriendOptimizationResult> {
    return new Promise((resolve, reject) => {
        const worker = new Worker(new URL('../friendOptimizer.worker.ts', import.meta.url), { type: 'module' });
        const request: FriendOptimizerWorkerRequest = { student1, student2, mode, topN };

        worker.onmessage = (event: MessageEvent<{ success: boolean; result?: FriendOptimizationResult; error?: string }>) => {
            worker.terminate();
            if (event.data.success && event.data.result) resolve(event.data.result);
            else reject(new Error(event.data.error || 'Friend optimizer failed'));
        };
        worker.onerror = (event) => {
            worker.terminate();
            reject(new Error(event.message || 'Friend optimizer worker failed'));
        };
        worker.postMessage(request);
    });
}
