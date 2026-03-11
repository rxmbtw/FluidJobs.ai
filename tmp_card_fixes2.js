const fs = require('fs');
const file = 'd:/FluidJobs.ai/FluidJobs.ai/src/components/new-dashboard/PipelineBoard.tsx';
let t = fs.readFileSync(file, 'utf8');

// 1. Remove all Eye buttons EXCEPT the "View Full Profile" and "View Profile" texts.
// The pattern looks like:
// <button
//   onClick={() => onViewProfile(candidate.id)} ... >
//   <Eye className="w-4 h-4" />
// </button>
// We'll use a regex that captures from <button to </button> that contains exactly <Eye className="w-4 h-4" /> and no other text.

const eyeButtonRegex = /<button[^>]*onClick=\{\(\) => onViewProfile\(candidate\.id\)\}[^>]*>\s*<Eye className="w-\d h-\d" \/>\s*<\/button>/g;
const matchCount = (t.match(eyeButtonRegex) || []).length;
console.log('Found ' + matchCount + ' Eye buttons to remove.');
t = t.replace(eyeButtonRegex, '');

// 2. Add onStatusAction and onMoveStage to CandidateCardActions
// It currently looks like:
//   <CandidateCardActions
//     candidate={candidate}
//     onViewFeedback={...}
//   />

const oldActionsCloseRegex = /(<CandidateCardActions[\s\S]*?onViewFeedback=\{[\s\S]*?\}\s*)\/>/g;
const newProps = `  onStatusAction={(candidate, action) => {
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

let actionCount = 0;
t = t.replace(oldActionsCloseRegex, (match, p1) => {
    actionCount++;
    return p1 + newProps;
});
console.log('Added props to ' + actionCount + ' CandidateCardActions.');

fs.writeFileSync(file, t);
