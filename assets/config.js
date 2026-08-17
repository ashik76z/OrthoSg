/* =========================================================================
   OrthoSG Finals Coach — site configuration
   Edit this file only. Nothing elsewhere invents a value.
   ========================================================================= */
window.ORTHOSG = {

  /* Where every "Start practising" button points. */
  gptUrl: "https://chatgpt.com/g/g-693972e764f481918076f012c25b08e0-ortho-exams-revision-assistant-for-final-year-v7-1",

  /* Shown in the footer. Update when the GPT or site content changes. */
  version: "v7.1",
  updated: "August 2026",

  /* ---------------------------------------------------------------------
     FEATURE FLAGS
     ---------------------------------------------------------------------
     voiceViva — Growth brief 3 and 8 make Voice Viva the flagship secondary
     CTA. Do NOT enable until the GPT has passed the section 3 voice
     behaviour spec (10 points) and the section 3 voice QA checklist
     (10 items), and the section 15 instruction changes are live.

     Advertising a voice viva that interrupts, coaches mid-station, or gives
     answers before the student commits breaks the section 2 promise of an
     excellent first 30 seconds, for exactly the students most worth keeping.

     true  -> Voice Viva appears as hero secondary CTA, first practice card,
              and nav link; voice-viva.html is linked throughout.
     false -> voice-viva.html still exists but is unlinked and marked as in
              preparation.
     --------------------------------------------------------------------- */
  features: {
    voiceViva: false
  },

  /* Where feedback goes. Set ONE.
     - feedbackFormUrl: opens an external form (e.g. Google Form) in a new tab
     - feedbackEmail:   opens the user's mail app with the report pre-filled
     If both are null the form still works, offers "Copy as text", and tells
     the user plainly that nothing was transmitted. */
  feedbackFormUrl: "https://forms.gle/eQ61Pxj2G6DMyGLh9",
  feedbackEmail: null
};
