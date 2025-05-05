var jsPsychBinaryChoiceTableFour = (function (jspsych) {
  "use strict";

  const info = {
    name: "binary-choice-table-four",
    parameters: {
      stimulus: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: 'stimulus',
        default: undefined,
        description: 'The HTML string to be displayed'
      },
      choices: {
        type: jspsych.ParameterType.KEYCODE,
        array: true,
        pretty_name: 'choices',
        default: ['F', 'J'], //jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      timing_response: {
        type: jspsych.ParameterType.INT,
        pretty_name: 'timing_response',
        default: 0,
        description: 'timing_response.'
      },
      doEyeTracking: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: 'eye-tracking',
        default: true,
        description: 'Whether to do the eye tracking during this trial.'
      },
      payoffYouTop: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: 'payoff-you-top',
        default: true,
        description: 'The order of payoff values. True mean "you recieve" payoff are shown in the top row.'
      },
      realOrPrac: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: 'real-or-prac',
        default: true,
        description: 'Whether it is a real choice, real- true'
      }, 
            /**
       * How long to show the stimulus.
       */
      stimulus_duration: {
          type: jspsych.ParameterType.INT,
          pretty_name: "Stimulus duration",
          default: null,
      },
      /**
       * How long to show trial before it ends.
       */
      trial_duration: {
          type: jspsych.ParameterType.INT,
          pretty_name: "Trial duration",
          default: null,
      },
      /**
       * If true, trial will end when subject makes a response.
       */
      response_ends_trial: {
          type: jspsych.ParameterType.BOOL,
          pretty_name: "Response ends trial",
          default: true,
      }
      
      },
  };

  /**
   * **binary-choice-table**
   *
   * SHORT PLUGIN DESCRIPTION
   *
   * @author YOUR NAME
   * @see {@link https://DOCUMENTATION_URL DOCUMENTATION LINK TEXT}
   */
  class BinaryChoiceTableFourPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {

      // set default values for the parameters
      trial.choices = trial.choices || [];
      //trial.timing_stim = trial.timing_stim || -1;
      trial.timing_response = trial.timing_response || -1;
      var keyboardListener;
    
      var response = {
        rt: -1,
        key: -1
      };
      console.log("in_trial: ", this);
      // this.jsPsych.extensions.webgazer.showPredictions();
      // this.jsPsych.extensions.webgazer.resume();
      
      // display stimuli

      
        // console.log('!!! display_stage');
        console.log(trial.stimulus['o1'], trial.stimulus['o2'], trial.stimulus['s1'], trial.stimulus['s2']);
        console.log("this: ",this);

        display_element.innerHTML = '';
        // var new_html = '';
        var table_stimulus =  ` <div id="div-table" style="display: flex; justify-content: center; align-items: center; height: 80vh;">
        <table class="b" style= "table-layout: fixed;
              border-collapse: collapse;
              border-style: hidden;
              margin-top: auto;
              margin-left: auto;
              margin-right: auto;
              margin-bottom: auto;
              max-width: 100%;
              max-height: 100%;
              ">
              <colgroup>
                    <col span="1" style="width: 11%;">
                    <col span="1" style="width: 26%;">
                    <col span="1" style="width: 26%;">
                    <col span="1" style="width: 26%; border-left: 1px gray solid;">
                    <col span="1" style="width: 11%;">
                  </colgroup>
                  <tr>
                    <th></th>
                    <th style="vertical-align: top; padding-left: 50px; padding-right: 50px; height: 25px;">Option A</th>
                    <th style="vertical-align: top; padding-left: 50px; padding-right: 50px;">Option B</th>
                    <th style="vertical-align: top; padding-left: 50px; padding-right: 50px;">Other Player Information</th>
                    <th></th>
                  </tr>
                  <tr style="vertical-align: top; height: 325px;">
                    <td style="text-align: left; padding-top: 150px;">${trial.payoffYouTop ? 'You get' : 'Other player gets'} </td>
                    <td style="text-align: center; padding-right: 50px; padding-top: 150px;" id="up-left">${trial.payoffYouTop ? trial.stimulus['s1'].toFixed(0) : trial.stimulus['o1'].toFixed(0) } </td>
                    <td style="text-align: center; padding-left: 50px; padding-right: 50px; padding-top: 150px; ">${trial.payoffYouTop ? trial.stimulus['s2'].toFixed(0) : trial.stimulus['o2'].toFixed(0) }</td>
                    <td style="text-align: center; padding-left: 50px; padding-right: 50px; padding-top: 150px;">${trial.payoffGroupTop ? trial.stimulus['ingroup'].toFixed(0) : trial.stimulus['random'].toFixed(0)}</td>
                    <td style="text-align: right; padding-left: 50px; padding-top: 150px;">${trial.payoffGroupTop ? globalgroup_text + '?': 'Random Number'}</td>
                </tr>
                <tr style="vertical-align: bottom; height: 325px;">
                    <td style="text-align: left; padding-bottom: 150px; border-top: 1px gray solid;">${trial.payoffYouTop ? 'Other player gets' : 'You get'}</td>
                    <td style="text-align: center; padding-right: 50px; padding-bottom: 150px; border-top: 1px gray solid;"> ${trial.payoffYouTop ? trial.stimulus['o1'].toFixed(0) : trial.stimulus['s1'].toFixed(0) }</td>     
                    <td style="text-align: center; padding-left: 50px; padding-right: 50px; padding-bottom: 150px; border-top: 1px gray solid;"> ${trial.payoffYouTop ? trial.stimulus['o2'].toFixed(0) : trial.stimulus['s2'].toFixed(0) } </td>
                    <td style="text-align: center; padding-left: 50px; padding-right: 50px; padding-bottom: 150px;" id="bottom-right">${trial.payoffGroupTop ? trial.stimulus['random'].toFixed(0) : trial.stimulus['ingroup'].toFixed(0)}</td>
                    <td style="text-align: right; padding-left: 50px; padding-bottom: 150px;">${trial.payoffGroupTop ? 'Random Number' : globalgroup_text + '?'}</td>
                </tr>
                  <tr>
              <th></th>
              <th style="vertical-align: bottom;  padding-right: 50px; height: 25px;">Option A</th>
              <th style="vertical-align: bottom; padding-left: 50px; padding-right: 50px;">Option B</th>
              <th style="vertical-align: bottom; padding-left: 50px; padding-right: 50px;">Other Player Information</th>
              <th></th>
              </tr>
            
              </table>
    
        </div>
      `;
        var new_html = '<div id="jspsych-html-keyboard-response-stimulus">' + table_stimulus + "</div>";
          
      // add prompt
      // if (trial.prompt !== null) {
      //     new_html += trial.prompt;
      // }
      // // draw
      display_element.innerHTML = new_html;
      // store response
      var response = {
          rt: null,
          key: null,
      };

      // turn on webgazer's loop
      console.log("in trial before", this);
      console.log("in trial web", this.jsPsych.extensions.webgazer.isInitialized());
     
      // function to end trial when it is time
      const end_trial = () => {
          // kill any remaining setTimeout handlers
          this.jsPsych.pluginAPI.clearAllTimeouts();
          // kill keyboard listeners
          if (typeof keyboardListener !== "undefined") {
              this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
          }
          // gather the data to store for the trial
          // var trial_data = {
          //     rt: response.rt,
          //     stimulus: trial.stimulus,
          //     response: response.key,
          // };
          var trial_data = {
            stimulus: trial.stimulus,
            rt: response.rt,
            key_press: response.key,
            choices: trial.choices,
            realtrial:  trial.realOrPrac
          };
          console.log("in end binary: ", this);
  
          // clear the display
          display_element.innerHTML = "";
          // move on to the next trial
          this.jsPsych.finishTrial(trial_data);
      };
      // function to handle responses by the subject
      var after_response = (info) => {
          // after a valid response, the stimulus will have the CSS class 'responded'
          // which can be used to provide visual feedback that a response was recorded
          display_element.querySelector("#jspsych-html-keyboard-response-stimulus").className +=
              " responded";
          // only record the first response
          if (response.key == null) {
              response = info;
          }
          if (trial.response_ends_trial) {
              end_trial();
          }
      };
      // start the response listener
      if (trial.choices != "NO_KEYS") {
          var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: after_response,
              valid_responses: trial.choices,
              rt_method: "performance",
              persist: false,
              allow_held_key: false,
          });
      }
      // hide stimulus if stimulus_duration is set
      if (trial.stimulus_duration !== null) {
          this.jsPsych.pluginAPI.setTimeout(() => {
              display_element.querySelector("#jspsych-html-keyboard-response-stimulus").style.visibility = "hidden";
          }, trial.stimulus_duration);
      }
      // end trial if trial_duration is set
      if (trial.trial_duration !== null) {
          this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
      }

  

    }
  }
  BinaryChoiceTableFourPlugin.info = info;

  return BinaryChoiceTableFourPlugin;
})(jsPsychModule);


