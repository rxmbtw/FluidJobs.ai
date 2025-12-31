const { sendEmail } = require('./emailService');

// Password Reset (noreply@fluidjobs.ai)
const sendPasswordReset = async (to, code) => {
  return sendEmail('noreply', {
    to,
    subject: 'FluidJobs.ai - Password Reset Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>Your verification code: <strong style="font-size: 24px;">${code}</strong></p>
        <p>Expires in 10 minutes.</p>
      </div>
    `
  });
};

// Assessment Link (assessments@fluidjobs.ai)
const sendAssessment = async (to, candidateName, assessmentLink, jobTitle) => {
  return sendEmail('assessments', {
    to,
    subject: `Assessment for ${jobTitle} Position`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${candidateName},</h2>
        <p>You've been invited to complete an assessment for the <strong>${jobTitle}</strong> position.</p>
        <a href="${assessmentLink}" style="display: inline-block; padding: 12px 24px; background: #4285F4; color: white; text-decoration: none; border-radius: 5px;">Start Assessment</a>
      </div>
    `
  });
};

// Job Application (jobs@fluidjobs.ai)
const sendJobApplication = async (to, candidateName, jobTitle, status) => {
  return sendEmail('jobs', {
    to,
    subject: `Application Update: ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${candidateName},</h2>
        <p>Your application for <strong>${jobTitle}</strong> has been ${status}.</p>
      </div>
    `
  });
};

// Interview Invitation (recruitment@fluidjobs.ai)
const sendInterviewInvite = async (to, candidateName, jobTitle, interviewDate, meetingLink) => {
  return sendEmail('recruitment', {
    to,
    subject: `Interview Invitation: ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${candidateName},</h2>
        <p>Congratulations! You've been shortlisted for <strong>${jobTitle}</strong>.</p>
        <p><strong>Interview Date:</strong> ${interviewDate}</p>
        <a href="${meetingLink}" style="display: inline-block; padding: 12px 24px; background: #34A853; color: white; text-decoration: none; border-radius: 5px;">Join Interview</a>
      </div>
    `
  });
};

module.exports = {
  sendPasswordReset,
  sendAssessment,
  sendJobApplication,
  sendInterviewInvite
};
