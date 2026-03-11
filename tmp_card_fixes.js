const fs = require('fs');
const file = 'd:/FluidJobs.ai/FluidJobs.ai/src/components/new-dashboard/PipelineBoard.tsx';
let t = fs.readFileSync(file, 'utf8');

// ==========================================
// FIX 1: Add onStatusAction and onMoveStage to all CandidateCardActions that are missing them
// They look like:
//   onViewFeedback={async (candidate, stage) => {
//     ...
//   }}
// />
// We need to add the two extra props before the closing />
// ==========================================
const OLD_ACTIONS_CLOSE = `                                    }}
                                  />
                                  <button
                                    onClick={() => onViewProfile(candidate.id)}
                                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all group"
                                    title="View candidate details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>`;

const NEW_ACTIONS_CLOSE = `                                    }}
                                    onStatusAction={(candidate, action) => {
                                      if (action === 'Reject') {
                                        CandidateService.updateCandidateStage({ candidateId: candidate.id, newStage: InterviewStage.REJECTED, userId: currentUser?.id || 'admin', reason: 'Rejected' });
                                        setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, stage: InterviewStage.REJECTED } : c));
                                      } else if (action === 'Drop') {
                                        CandidateService.updateCandidateStage({ candidateId: candidate.id, newStage: InterviewStage.DROPPED, userId: currentUser?.id || 'admin', reason: 'Dropped' });
                                        setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, stage: InterviewStage.DROPPED } : c));
                                      } else if (action === 'Hold') {
                                        CandidateService.updateCandidateStage({ candidateId: candidate.id, newStage: InterviewStage.ON_HOLD, userId: currentUser?.id || 'admin', reason: 'On Hold' });
                                        setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, stage: InterviewStage.ON_HOLD } : c));
                                      }
                                    }}
                                    onMoveStage={(candidate) => { handleStageJump(candidate, 'forward'); }}
                                  />`;

const count = (t.match(new RegExp(OLD_ACTIONS_CLOSE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
console.log('Found', count, 'Eye+close blocks to replace');
t = t.split(OLD_ACTIONS_CLOSE).join(NEW_ACTIONS_CLOSE);

// ==========================================
// FIX 2: Remove small standalone Eye-only view buttons that appear alone in card headers
// These look like:
//   <button
//     onClick={() => onViewProfile(candidate.id)}
//     className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
//     title="View candidate details"
//   >
//     <Eye className="w-4 h-4" />
//   </button>
// Remove ONLY the standalone icon buttons (not "View Full Profile" or "View Profile" text buttons)
// ==========================================
const EYE_BTN_1 = `\n                                  <button\n                                    onClick={() => onViewProfile(candidate.id)}\n                                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all group"\n                                    title="View candidate details"\n                                  >\n                                    <Eye className="w-4 h-4" />\n                                  </button>`;

const count2 = (t.match(new RegExp(EYE_BTN_1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
console.log('Found', count2, 'remaining eye-only buttons');
t = t.split(EYE_BTN_1).join('');

// Also handle the eye button that appears within the board list view at different indentation
const eyePatterns = [
    // 12-space indent variant
    /\n\s{16,}<button\s*\n\s+onClick=\{\(\) => onViewProfile\(candidate\.id\)\}\s*\n\s+className="[^"]*Eye[^"]*"\s*\n\s+title="View candidate details"\s*\n\s+>\s*\n\s+<Eye className="w-4 h-4" \/>\s*\n\s+<\/button>/g,
    // Also the sm variant
    /\n\s+<button\s*\n\s+onClick=\{\(\) => onViewProfile\(candidate\.id\)\}\s*\n\s+className="[^"]*hover:text-blue-600[^"]*"\s*\n\s+title="View candidate details"\s*\n\s+>\s*\n\s+<Eye className="w-[34].? h-[34].?" \/>\s*\n\s+<\/button>/g
];

for (const pat of eyePatterns) {
    const m = t.match(pat) || [];
    console.log('Regex pattern found', m.length, 'matches');
    t = t.replace(pat, '');
}

fs.writeFileSync(file, t);
console.log('Done with PipelineBoard fixes!');
