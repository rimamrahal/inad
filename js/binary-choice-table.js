var jsPsychBinaryChoiceTable = (function (jspsych) {
  "use strict";

  const info = {
    name: "binary-choice-table",
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
  class BinaryChoiceTablePlugin {
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

    // display stimuli
    var display_stage = function () {
      
      // console.log('!!! display_stage');
      console.log(trial.stimulus['o1']);
      
    
      kill_timers();
      kill_listeners();

      display_element.innerHTML = '';
      var new_html = '';


      // new_html += '<div class="container-multi-choice">';
      // new_html += '<div class="container-multi-choice-column" id= "multiattribute-choices-stimulus-left">';
      // new_html += `<div id="multiattribute-choices-stimulus-left " ><img height="320px" width="450px" src="${trial.stimulus[0]}"/></div>`;
      // new_html += '</div>';
      // new_html += '<div class="container-multi-choice-column" id= "multiattribute-choices-stimulus-right">';
      // new_html += `<div id="multiattribute-choices-stimulus-right " ><img height="320px" width="450px" src="${trial.stimulus[1]}"/></div>`;
      // new_html += '</div>';
      // new_html += '<div id="binary-timeoutinfo"></div>';
      // new_html += '</div>';
      new_html += `<div id="div-table">
      <table class="b" style= "  table-layout: fixed;
      border-collapse: collapse;
        border-style: hidden;
      ">
        <colgroup>
          <col span="1" style="width: 20%;">
          <col span="1" style="width: 15%;">
          <col span="1" style="width: 15%;">
          <col span="1" style="width: 15%; border-left: 2px white solid;">
          <col span="1" style="width: 15%;">
          <col span="1" style="width: 20%;">
      </colgroup>
      <tr>
        <th></th>
        <th></th>
        <th>Option A</th>
        <th>Option B</th>
        <th></th>
      </tr>
      <tr>
        <td style="text-align: left;">You receive</td>
        <td></td>
        <td>${trial.stimulus['s1'].toFixed(1)} </td>
        <td>${trial.stimulus['s2'].toFixed(1)}</td>
        <td></td>
        <td></td>
      </tr>
      <tr>
      <td style="text-align: left;">The other player receives</td>
        <td> ${trial.stimulus['o1'].toFixed(1)}</td>
        <td></td>
        <td></td>
        <td> ${trial.stimulus['o2'].toFixed(1)} </td>
        <td></td>
      </tr>
      <tr>
      <td style="text-align: left;">Total payment</td>
        <td>${trial.stimulus['sum1'].toFixed(1)}</td>
        <td></td>
        <td></td>
        <td>${trial.stimulus['sum2'].toFixed(1)}</td>
        <td></td>
      </tr>
      <tr>
      <td style="text-align: left;">Payout difference</td>
        <td></td>
        <td>${trial.stimulus['diff1'].toFixed(1)}</td>
        <td>${trial.stimulus['diff2'].toFixed(1)}</td>
        <td></td>
        <td></td>
      </tr>
      </table>
    </div>
    `;
      display_element.innerHTML = new_html;
    };

    var display_selection = function () {
      var selected;
      if (String.fromCharCode(response.key) == trial.choices[0]) {
        selected = '#multiattribute-choices-stimulus-left';
      } else {
        selected = '#multiattribute-choices-stimulus-right';
      }
      $(selected).css('border', `6px solid ${selected_color}`);
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
            display_selection();
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

    
    


    var end_trial = function (timeout) {

   //   webgazer.pause();
   ///   clearInterval(eye_tracking_interval);
   if(trial.doEyeTracking) {
    webgazer.pause();
    // clearInterval(eye_tracking_interval); 
  }
      // data saving
      var trial_data = {
        "stimulus": trial.stimulus,
        "left_stimulus":trial.stimulus[0],
        "right_stimulus": trial.stimulus[1],
        "probability":trial.Probabilty,
        "rt": response.rt,
        "key_press": response.key,
        "choices": trial.choices,
        "eyeData": JSON.stringify(eyeData),
        "realtrial":  trial.realOrPrac
      };
      jsPsych.finishTrial(trial_data);
    };

    var eyeData = {history:[]};
    display_stimuli();
    if(trial.doEyeTracking) {
      console.log("dooooooo eye");
      jsPsych.extensions.webgazer.resume();
      // jsPsych.extensions.webgazer.showVideo();
      jsPsych.extensions.webgazer.hideVideo();
      jsPsych.extensions.webgazer.showPredictions();
      // jsPsych.extensions.webgazer.hidePredictions();
    // webgazer.showFaceOverlay(false);
    // webgazer.showFaceFeedbackBox(false);
    var starttime = performance.now();
    // var eye_tracking_interval = setInterval(
    //   function() {
    //     var pos =  jsPsych.extensions.webgazer.getCurrentPrediction();
    //     console.log(pos.eyeFeatures);

    //     if (pos) {

    //       var relativePosX = pos.x/screen.width ;
    //       var relativePosY = pos.y/screen.height;
    //       var relativePosX2= pos.x/innerWidth ;
    //       var relativePosY2 = pos.y/innerHeight;
    //       eyeData.history.push({
    //        // 'x': pos.x,
    //       //  'y': pos.y,
    //         'relative-x': relativePosX,
    //         'relative-y': relativePosY,
    //         'relative-x2': relativePosX2,
    //         'relative-y2': relativePosY2,
    //         'elapse-time': performance.now() - starttime
    //       });
    //     }
    //   },20);
    var cancelGazeUpdateHandler = jsPsych.extensions.webgazer.onGazeUpdate(function(prediction){
      console.log(`Currently looking at ${prediction.x}, ${prediction.y}`);
    });
    
    cancelGazeUpdateHandler();
    }

    
      // // data saving
      // var trial_data = {
      //   parameter_name: "parameter value",
      // };
      // // end trial
      // this.jsPsych.finishTrial(trial_data);
    }
  }
  BinaryChoiceTablePlugin.info = info;

  return BinaryChoiceTablePlugin;
})(jsPsychModule);


