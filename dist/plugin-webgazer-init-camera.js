var jsPsychWebgazerInitCamera = (function (jspsych) {
  'use strict';

  const info = {
      name: "webgazer-init-camera",
      parameters: {
          /** Instruction text */
          instructions: {
              type: jspsych.ParameterType.HTML_STRING,
              default: `
            <p>Position your head so that the camera captures your eyes clearly.</p>
            <p>Place your face in the center of the box. Look directly into the camera. Green dots will appear on your face and the box will turn green.</p>
            <p>If this doesn't happen, adjust your position. Follow these rules: keep light sources in front of you, and sit close enough to the camera.</p>
            <p>When your face is in the center of the box and the box turns green, you can click to continue.</p>
`,
          },
          /** Text for the button that participants click to end the trial. */
          button_text: {
              type: jspsych.ParameterType.STRING,
              default: "Weiter",
          },
      },
  };
  /**
   * **webgazer-init-camera**
   *
   * jsPsych plugin for initializing the webcam and helping the participant center their face in the camera view.
   * Intended for use with the WebGazer eye-tracking extension.
   *
   * @author Josh de Leeuw
   * @see {@link https://www.jspsych.org/plugins/jspsych-webgazer-init-camera/ webgazer-init-camera plugin} and
   * {@link https://www.jspsych.org/overview/eye-tracking/ eye-tracking overview} documentation on jspsych.org
   */
  class WebgazerInitCameraPlugin {
      constructor(jsPsych) {
          this.jsPsych = jsPsych;
      }
      trial(display_element, trial, on_load) {
          let trial_complete;
          var start_time = performance.now();
          var load_time;
          // function to end trial when it is time
          const end_trial = () => {
              this.jsPsych.extensions["webgazer"].pause();
              this.jsPsych.extensions["webgazer"].hideVideo();
              // kill any remaining setTimeout handlers
              this.jsPsych.pluginAPI.clearAllTimeouts();
              // gather the data to store for the trial
              var trial_data = {
                  load_time: load_time,
              };
              // clear the display
              display_element.innerHTML = "";
              document.querySelector("#webgazer-center-style").remove();
              // move on to the next trial
              this.jsPsych.finishTrial(trial_data);
              trial_complete();
          };
          const showTrial = () => {
              on_load();
              load_time = Math.round(performance.now() - start_time);
              var style = `
          <style id="webgazer-center-style">
            #webgazerVideoContainer { top: 20px !important; left: calc(50% - 160px) !important;}
          </style>
        `;
              document.querySelector("head").insertAdjacentHTML("beforeend", style);
              var html = `
          <div id='webgazer-init-container' style='position: relative; width:100vw; height:100vh'>
          </div>`;
              display_element.innerHTML = html;
              this.jsPsych.extensions["webgazer"].showVideo();
              this.jsPsych.extensions["webgazer"].resume();
              var wg_container = display_element.querySelector("#webgazer-init-container");
              wg_container.innerHTML = `
          <div style='position: absolute; top: max(260px, 40%); left: calc(50% - 400px); width:800px;'>
          ${trial.instructions}
          <button id='jspsych-wg-cont' class='jspsych-btn' disabled>${trial.button_text}</button>
          </div>`;
              if (is_face_detect_green()) {
                  document.querySelector("#jspsych-wg-cont").disabled = false;
              }
              else {
                  var observer = new MutationObserver(face_detect_event_observer);
                  observer.observe(document, {
                      attributes: true,
                      attributeFilter: ["style"],
                      subtree: true,
                  });
              }
              document.querySelector("#jspsych-wg-cont").addEventListener("click", () => {
                  if (observer) {
                      observer.disconnect();
                  }
                  end_trial();
              });
          };
          if (!this.jsPsych.extensions.webgazer.isInitialized()) {
              this.jsPsych.extensions.webgazer
                  .start()
                  .then(() => {
                  showTrial();
              })
                  .catch((error) => {
                  console.log(error);
                  display_element.innerHTML = `<p>The experiment cannot continue because the eye tracker failed to start.</p>
              <p>This may be because of a technical problem or because you did not grant permission for the page to use your camera.</p>`;
              });
          }
          else {
              showTrial();
          }
          function is_face_detect_green() {
              if (document.querySelector("#webgazerFaceFeedbackBox")) {
                  return (document.querySelector("#webgazerFaceFeedbackBox").style.borderColor ==
                      "green");
              }
              else {
                  return false;
              }
          }
          function face_detect_event_observer(mutationsList, observer) {
              if (mutationsList[0].target == document.querySelector("#webgazerFaceFeedbackBox")) {
                  if (mutationsList[0].type == "attributes" &&
                      mutationsList[0].target.style.borderColor == "green") {
                      document.querySelector("#jspsych-wg-cont").disabled = false;
                  }
                  if (mutationsList[0].type == "attributes" &&
                      mutationsList[0].target.style.borderColor == "red") {
                      document.querySelector("#jspsych-wg-cont").disabled = true;
                  }
              }
          }
          return new Promise((resolve) => {
              trial_complete = resolve;
          });
      }
  }
  WebgazerInitCameraPlugin.info = info;

  return WebgazerInitCameraPlugin;

})(jsPsychModule);
