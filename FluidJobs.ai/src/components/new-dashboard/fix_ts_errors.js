const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'PipelineBoard.tsx');
let content = fs.readFileSync(file, 'utf8');

const regex = /if\s*\(result\.success\s*&&\s*result\.candidate\)\s*\{\s*setCandidates\(prev\s*=>\s*prev\.map\(c\s*=>\s*c\.id\s*===\s*candidate\.id\s*\?\s*\{\s*\.\.\.result\.candidate,\s*stage:\s*result\.candidate\.currentStage\s*\}\s*:\s*c\s*\)\);\s*\}/g;

const replacement = `if (result.success && result.candidate) {
                                            setCandidates(prev => prev.map(c => 
                                                c.id === candidate.id ? { 
                                                    ...c,
                                                    stage: result.candidate!.currentStage || targetStage
                                                } : c
                                            ));
                                        }`;

const matches = content.match(regex);
console.log('Found matches:', matches ? matches.length : 0);
if (matches) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Update complete');
}
