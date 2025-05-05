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
      realOrPrac: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: 'eye-tracking',
        default: true,
        description: 'Whether it is a real choice, real- true'
      },
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
      var selected_color = 'rgb(5, 157, 190)';
      var setTimeoutHandlers = [];
      var keyboardListener;
    
      var response = {
        rt: -1,
        key: -1
      };
      console.log("in_trial: ", this);
      // this.jsPsych.extensions.webgazer.showPredictions();
      // this.jsPsych.extensions.webgazer.resume();
      
      // display stimuli
      var display_stage = function () {
      
        // console.log('!!! display_stage');
        console.log(trial.stimulus['o1']);
        console.log("this: ",this);
        
      
        kill_timers();
        kill_listeners();

        display_element.innerHTML = '';
        var new_html = '';

        new_html += ` <div id="div-table" style="margin: auto;">
        <table class="b" style= "table-layout: fixed;
          border-collapse: collapse;
          border-style: hidden;
          ">
          <colgroup>
              <col span="1" style="width: 20%;">
            
              <col span="1" style="width: 30%;">
              <col span="1" style="width: 30%; border-left: 2px white solid;">
              <col span="1" style="width: 20%;">
          </colgroup>
          <tr>
      
          <th></th>
          <th style="vertical-align: top; height: 50px;">Option A</th>
          <th style="vertical-align: top;">Option B</th>
          </tr>
          <tr style="vertical-align: center;">
              <td style="text-align: left;">You receive</td>
              <td style="text-align: center;" id="up-left">${trial.stimulus['s1'].toFixed(1)} </td>
              <td style="text-align: center;">${trial.stimulus['s2'].toFixed(1)}</td>
              <td></td>
          </tr>
          <tr style="vertical-align: center;">
              <td style="text-align: left;">The other player receives</td>
              <td style="text-align: center;"> ${trial.stimulus['o1'].toFixed(1)}</td>     
              <td style="text-align: center;" id="bottom-right"> ${trial.stimulus['o2'].toFixed(1)} </td>
              <td></td>
          </tr>
        
          </table>
  
        </div>
      `;
        display_element.innerHTML = new_html;
      };

    
    var display_timeout = function () {
      $('binary-timeoutinfo').text('Time out!');
    };

    var kill_timers = function () {
      for (var i = 0; i < setTimeoutHandlers.length; i++) {
        clearTimeout(setTimeoutHandlers[i]);
      }
    };


    var kill_listeners = function () {
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }
    };

    var start_response_listener = function () {
      if (trial.choices != "NO_KEYS") {
        keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
          valid_responses: trial.choices,
          rt_method: 'performance',
          persist: false,
          allow_held_key: false,
          callback_function: function (info) {
            kill_listeners();
            kill_timers();
            response = info;
            // display_selection();
            setTimeout(() => end_trial(false), 500);
          },
        });
      }
    };
    
    var display_stimuli = function () {
      kill_timers();
      kill_listeners();
      display_stage();
      start_response_listener();
     

  
      if (trial.timing_response > 0) {
        var response_timer = setTimeout(function () {
         
          kill_listeners();
          display_timeout();
          setTimeout(() => end_trial(true), 500);
        }, trial.timing_response);
         setTimeoutHandlers.push(response_timer);
      }
    };

    
  

    const end_trial = () => {
      var trial_data = {
        stimulus: trial.stimulus,
        left_stimulus:trial.stimulus[0],
        right_stimulus: trial.stimulus[1],
        probability:trial.Probabilty,
        rt: response.rt,
        key_press: response.key,
        choices: trial.choices,
        eyeData: JSON.stringify(eyeData),
        realtrial:  trial.realOrPrac
      };
      console.log("in end binary: ", this);
      jsPsych.finishTrial(trial_data);
    };

    var eyeData = {history:[]};
    display_stimuli();
    
    }
  }
  BinaryChoiceTableFourPlugin.info = info;

  return BinaryChoiceTableFourPlugin;
})(jsPsychModule);


