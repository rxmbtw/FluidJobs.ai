const fs = require('fs');

const path = require('path');
const file = path.join(__dirname, 'PipelineBoard.tsx');
let content = fs.readFileSync(file, 'utf8');

const regex = /<CandidateCardActions\s+candidate={candidate}\s+onViewFeedback={async\s*\(candidate,\s*stage\)\s*=>\s*\{\s*const\s*history\s*=\s*await\s*CandidateService\.getStageHistory\(candidate\.id\);\s*setSelectedFeedbackCandidate\(\{\s*\.\.\.candidate,\s*stageHistory:\s*history\s*\}\);\s*setSelectedFeedbackStage\(getPreviousStage\(stage\)\);\s*setShowFeedbackReviewModal\(true\);\s*\}\}\s*\/>/g;

const replacement = `<CandidateCardActions
                                    candidate={candidate}
                                    onViewFeedback={async (candidate, stage) => {
                                      const history = await CandidateService.getStageHistory(candidate.id);
                                      setSelectedFeedbackCandidate({ ...candidate, stageHistory: history });
                                      setSelectedFeedbackStage(getPreviousStage(stage));
                                      setShowFeedbackReviewModal(true);
                                    }}
                                    onMoveStage={(candidate) => handleStageJump(candidate, 'forward')}
                                    onStatusAction={async (candidate, action) => {
                                      const targetStage = action === 'Reject' ? 'Rejected' : action === 'Drop' ? 'Dropped' : 'On Hold';
                                      try {
                                        const effectiveUser = currentUser || { id: 'admin', name: 'Admin', role: 'superadmin' };
                                        const result = await CandidateService.updateCandidateStage({
                                          candidateId: candidate.id,
                                          newStage: targetStage,
                                          userId: effectiveUser.id,
                                          reason: \`Marked as \${action} via quick actions\`
                                        });
                                        if (result.success && result.candidate) {
                                            setCandidates(prev => prev.map(c => 
                                                c.id === candidate.id ? { 
                                                    ...result.candidate, 
                                                    stage: result.candidate.currentStage 
                                                } : c
                                            ));
                                        } else {
                                            alert(\`Failed to update stage: \${result.error || 'Unknown error'}\`);
                                        }
                                      } catch (error) {
                                          console.error('Fast status update failed:', error);
                                      }
                                    }}
                                  />`;

const matches = content.match(regex);
console.log('Found matches:', matches ? matches.length : 0);
if (matches) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Update complete');
}

