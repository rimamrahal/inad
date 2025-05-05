   /* preload files */
   var preload = {
    type: jsPsychPreload,
    images: [
      '../img/instruct0.png',
      '../img/instruct1.png'],
    audio: [
      '../img/1Case.m4a',
      '../img/10Wiretap.m4a',
      '../img/13WiretapDisregard.m4a',
      '../img/14Wireta Normative.m4a',
      '../img/15WiretapNeutralize.m4a',
      '../img/audiotest.m4a',
    ]
  };

  var correct_word = "MUSIC"; 

  function makeSurveyCode(status) {
    uploadSubjectStatus(status);
    var prefix = {'success': 'cg', 'failed': 'sb'}[status]
    return `${prefix}${subject_id}`;
  }
  
  function uploadSubjectStatus(status) {
    $.ajax({
      type: "POST",
      url: "/subject-status",
      data: JSON.stringify({subject_id, status}),
      contentType: "application/json"
    });
  }

  var jsPsych = initJsPsych({
    override_safe_mode: true,
    extensions: [
      {type: jsPsychExtensionWebgazer}
    ], 
    on_finish: () => on_finish_callback(),
    on_close: () => on_finish_callback(),
    on_trial_finish: function () {if(successExp) {
      document.body.style.cursor = 'auto';
      var randomCode = jsPsych.randomization.randomID(7);
      jsPsych.endExperiment(`<div>
          Thanks for participating! 
          <br> <br>
          Your participation code is XXXXXXXXXX.
          <br> <br> 
          Please return to Prolifict and enter this code to get paid.
          <br> <br>You can close this window afterwards.
      </div>`);
      }
  }
  });
  var subject_id = jsPsych.randomization.randomID(7);
 


var on_finish_callback = function () {
  // jsPsych.data.displayData();
  jsPsych.data.addProperties({
      browser_name: bowser.name,
      browser_type: bowser.version,
      subject: subject_id, 
      interaction: jsPsych.data.getInteractionData().json(),
      windowWidth: screen.width,
      windowHeight: screen.height, 
      condition: condition,
      strings_and_cells: strings_and_cells,
  });
  var data = JSON.stringify(jsPsych.data.get().values());
  $.ajax({
       type: "POST",
       url: "/data",
       data: data,
       contentType: "application/json"
     })
     .done(function () {
      ("Thanks for taking part!" +
      "Your participation code is: <b> 92830102." +
      "Please enter it on Prolific. " +
      "You can then close this window.")
     })
     .fail(function () {
       ("A problem occured while saving the data." +
       "Please save the data to your computer and send it to the experimenter via email: rahal@coll.mpg.de.") ;
       var failsavecsv = jsPsych.data.get().cvs();
       var failsavefilename = jsPsych.data.get().values()[0].subject_id+".csv";
       downloadCSV(csv,failsavefilename);
  })
}


  // **********************
  // ****** Trials ********
  // **********************

    ///////
    /////// Welcome
    ///////

    var fixation_duration = 500;
    var successExp = false;
    var resize_screen = false;
    var point_size = 50;
    var threshold = 70; // at least 70% of gazes must be inside a given ROI to be considered accurate (threshold)
    var recalibrate_criterion = 0.2; // if at least 2 ROIs (2 points out of 9 total points shown = 0.22) are below the threshold set above, this will trigger recalibration in the initial validation phases (not while the task is running)
    var calibration_mode = 'view';

    console.log(subject_id)
    console.log(recalibrate_criterion)
    console.log(threshold)

    function closeFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        /* IE/Edge */
        document.msExitFullscreen();
      }
    }

    /** full screen */
    var fullscreenEnter = {
    type: jsPsychFullscreen,
    message: `<div> Before we begin, please close any unnecessary browser tabs, programs or applications on your computer. <br/>
    This will help the study run more smoothly and ensure that no popups or alerts can interfere with the study.    <br/>
    The study will switch to fullscreen mode after this page.    <br/>
    <b>DO NOT EXIT</b> fullscreen mode or you will terminate the study and not receive any payment. <br/>   
    When you are ready to begin, press the button.<br> <br></div>
  `,
    fullscreen_mode: true,
    on_finish: function () {
    window.onresize = resize
    function resize() {
      if(successExp && !resize_screen){
        resize_screen = false;
        console.log("end experiment resize");
      } else{
        resize_screen = true;
        console.log("Resized!");
        alert("You exited the full screen mode! The experiment cannot continue!");
        window.location.href = "failed.html";
        
      }
    }
  }
  };


  var audio_word_entry = {
    type: jsPsychSurveyHtmlForm,
    html: `
    <div style="text-align: center; font-size: 20px;">
      <p>Please listen to the audio recording.<br>It will play for about 17 seconds.</p>
      <audio id="audio-stimulus" controls style="margin-top: 20px;" src="../img/audiotest.m4a" autoplay>
        Your browser does not support the audio element.
      </audio>
      <br><br><br>
      <p style="font-size: 20px;">Enter the word spoken at the end here, using ONLY CAPITAL LETTERS:</p>
      <input type="text" id="word_input" name="word_input" style="width: 300px; text-align: center;" required>
    </div>
    <br><br><br>
    `,
    button_label: "Submit",
    on_load: function() {
      // Automatically play the audio when the trial loads
      document.getElementById('audio-stimulus').play();
    },
    on_finish: function(data) {
      // Store the entered word for use in the next trial
      jsPsych.data.addDataToLastTrial({
        word_input: data.response.word_input
      });
    }
  };

  // Conditional message if the audio test failed
  var audio_test_failed_message = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div style="text-align: center; font-size: 20px;">
        <p>Sorry, this was not the right word.</p>
        <p>Unfortunately, you cannot participate in this study. Thanks for your willingness to take part, and hopefully see you in another study!</p>
        <br><br><br>
        <div class="continue-instructions">Press spacebar to continue.</div>
      </div>
    `,
    choices: [' '],
    on_finish: function() {
      jsPsych.endExperiment('Thank you for your participation.');  // End the experiment after this message
    }
  };

  // Check if the word entered by the participant is correct
  var check_word_trial = {
    timeline: [audio_test_failed_message],
    conditional_function: function() {
      var last_trial_data = jsPsych.data.getLastTrialData().values()[0];
      // Check if the entered word matches the correct word
      return last_trial_data.word_input !== correct_word;
    }
  };

  var demographics_questionnaire = {
    type: jsPsychSurveyHtmlForm,
    preamble: '<p>Please answer the following questions about yourself:</p>',
    html: `
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div style="display: flex; flex-direction: column; width: 100%; max-width: 600px;">
        <!-- Row 1: Age -->
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <div style="flex: 1; text-align: right; padding-right: 20px;">
            <label for="age">Age:</label>
          </div>
          <div style="flex: 1; text-align: left;">
            <input type="number" id="age" name="age" style="width: 100%;" required>
          </div>
        </div>
        <!-- Row 2: Gender -->
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <div style="flex: 1; text-align: right; padding-right: 20px;">
            <label for="gender">Gender you identify with:</label>
          </div>
          <div style="flex: 1; text-align: left;">
            <input type="text" id="gender" name="gender" style="width: 100%;" required>
          </div>
        </div>
        <!-- Row 3: Courtroom Preference -->
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <div style="flex: 1; text-align: right; padding-right: 20px;">
            <label>Do you like watching movies or series about courtroom drama, lawyers, or judges?</label>
          </div>
          <div style="flex: 1; text-align: left;">
            <input type="radio" id="courtroom_yes" name="courtroom_preference" value="yes" required>
            <label for="courtroom_yes">yes</label>
            <input type="radio" id="courtroom_no" name="courtroom_preference" value="no" style="margin-left: 20px;" required>
            <label for="courtroom_no">no</label>
          </div>
        </div>
        <!-- Row 4: Jury Experience -->
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <div style="flex: 1; text-align: right; padding-right: 20px;">
            <label>Have you ever sat on a jury for a criminal case in court?</label>
          </div>
          <div style="flex: 1; text-align: left;">
            <input type="radio" id="jury_yes" name="jury_experience" value="yes" required>
            <label for="jury_yes">yes</label>
            <input type="radio" id="jury_no" name="jury_experience" value="no" style="margin-left: 20px;" required>
            <label for="jury_no">no</label>
          </div>
        </div>
      </div>
    </div>
    `,
    button_label: "Click here to continue",  
    on_finish: function(data) {
      jury_experience = data.response.jury_experience;
    }
  };
    ///////
    /////// INTRO 1
    ///////


    var introduction = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
        <div style="text-align: justify; width: 66%; margin: auto;">
          <p>In the first part of this study, you will be asked to read and evaluate some texts.</p>
          <p>These texts will be used for future research questions, among other things. Your assessment of the texts will help us learn more about how participants understand these texts and what they think about the content.</p>
          <p>You will read several texts of different types. After each text, it is your task to evaluate the texts on various dimensions.</p>
          <p>If you have read and understood these instructions, you can now begin evaluating the texts.</p>
          <br><br>
          <div class="continue-instructions">Press SPACE to continue</div>
        </div>
      `,
      choices: [' ']
    };

    ///////
    /////// DISTRACTORS
    ///////


    var distractors_instructions = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
        <div style="text-align: center;">
          <p><strong>Let's move on to the first text!</strong></p>
          <p>Please read the text carefully. It may consist of several pages.</p>
          <p>Once you have read the text, we will ask you some questions about it.</p>
          <br>
          <div class="continue-instructions">Press SPACE to continue</div>
        </div>
      `,
      choices: [' ']
    };


    var distractors_story_1 = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
        <div style="width:66%; margin: 0 auto;" class="case-instructions-container">
          <p>A long time ago, there lived a king whose wisdom was famous throughout the land. Nothing remained unknown to him, and it was as if news of the most hidden things were brought to him through the air.</p>
          <p>But he had a strange custom. Every day at midday, when everything had been cleared from the table and no one was present, a trusted servant had to bring a dish. But it was covered, and the servant himself did not know what was in it, and no one knew, for the king did not uncover it or eat from it until he was quite alone.</p>
          <p>This had already gone on for a long time, and one day the servant who was carrying the dish away again was overcome by such curiosity that he could not resist, but took the dish into his room. When he had carefully closed the door, he lifted the lid, and there he saw that a white snake was lying inside.</p>
          <p>When he saw it, he could not resist the desire to taste it; he cut off a little piece and put it in his mouth. But no sooner had it touched his tongue than he heard a strange whispering of delicate voices outside his window.</p>
          <p>He went over and listened, and realized that it was the sparrows talking to each other and telling each other all sorts of things they had seen in the fields and forests. Eating the snake had given him the ability to understand the language of animals.</p>
          <br>
          <div style="text-align: center;" class="continue-instructions">Press SPACE to continue</div>
        </div>
      `,
      choices: [' ']
    };


    var distractotors_questions_1 = {
      type: jsPsychSurveyLikert,
      questions: [
        {
          prompt: "How easy to understand did you find the text overall?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (totally)"],
          required: true
        },
        {
          prompt: "Do you think that the content of the text is suitable for primary school children?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (totally)"],
          required: true
        },
        {
          prompt: "To what extent did you find the king's motivation for wanting to keep the snake secret understandable?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (totally)"],
          required: true
        },
        {
          prompt: "To what extent did you find the king's motivation for wanting to keep the snake secret reprehensible <br>given that other people might also want to be able to understand animals?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (totally)"],
          required: true
        }
      ],
      button_label: "Continue",
    };
    

    var distractotors_questions_2 = {
      type: jsPsychSurveyLikert,
      questions: [
        {
          prompt: "Did the old-fashioned expressions bother you while reading the text?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (totally)"],
          required: true
        }
      ],
      button_label: "Continue",
    };

    var distractotors_questions_3 = {
      type: jsPsychSurveyText,
      questions: [
        {
          prompt: "Which animal did the servant understand after eating the snake?",
          placeholder: "Type your answer here...",
          rows: 1,
          columns: 50,
          required: true
        }
      ],
      button_label: "Continue",
    };

    var distractors_outro = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
        <div style="text-align: center;">
          <p>Let's move on to the next text!</p>
          <p>Please read the text carefully. It may consist of several pages.</p>
          <p>Once you have read the text, we will ask you some questions about it.</p>
          <br><br>
          <div class="continue-instructions">Press SPACE to continue</div>
        </div>
      `,
      choices: [' ']
    };

    ///////
    /////// EVAL
    ///////
    

    var charge_screen = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
        <div style="width:66%; margin: 0 auto;" class="case-instructions-container">
          <p>Charge:</p>
          <p>Jason Wells is accused of having stolen 5200 $ from the safe of his employer "Construction Ltd.".</p>
          <br><br><br>
          <div class="continue-instructions">Press SPACE to continue</div>
        </div>
      `,
      choices: [' ']
    };    


    var eval_access_to_the_safe = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
        <div style="width:66%; margin: 0 auto;" class="case-instructions-container">
          <p><strong>Access to the Safe</strong></p>
          <p>The accountant of the company testifies: at the end of each day, she puts the cash money in the safe of the company. She also put the cash in the safe on the evening in question. The morning after, the accountant noticed that $5,200 in cash was missing.</p>
          <p>The safe is located at the back of the accounting office. Apart from the accountant and her assistant, the construction managers, sales managers, and managers also have access to the safe. Overall, 8 people, including Jason Wells, have access to the safe.
          The safe is equipped with a mechanism that records when the safe is opened and closed. The time mechanism showed that the safe had last been opened at 7:14 p.m. on the evening in question, two hours after the accountant had locked the safe.</p>
          <br><br><br>
          <div style="text-align: center;" class="continue-instructions">Press SPACE to continue</div>
        </div>
      `,
      choices: [' ']
    };


    var eval_school_event = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
        <div style="width:66%; margin: 0 auto;" class="case-instructions-container">
          <p><strong>School Event</strong></p>
          <p>Silvia, a manager of "Construction Ltd.", testified that she saw Jason Wells at 8 p.m. on the evening in question when they each picked up their respective children from an event at school.</p>
          Jason Wells was wearing elegant trousers and a jacket he had not worn at work.
          Silvia testified that, at that time of day, it takes between 45 and 50 minutes to get from the office to the school at the other end of town.</p>
          <br><br><br>
          <div style="text-align: center;" class="continue-instructions">Press SPACE to continue</div>
        </div>
      `,
      choices: [' ']
    };


    var eval_uncertain_witness = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
        <div style="width:66%; margin: 0 auto;" class="case-instructions-container">
          <p><strong>Uncertain Witness</strong></p>
          <p>A technician who had been called to repair the photocopier testified that he had seen someone leaving the accountant's office in great haste at about 7:15 p.m.
          When questioned by the private detective P. a day after the incident, the technician identified Jason Wells as the person he had seen.
          When asked how sure he was about this, the technician said he was "at least 80%" certain. He explained that he had seen Jason Wells once or twice before in the office.</p>
          <br><br><br>
          <div style="text-align: center;" class="continue-instructions">Press SPACE to continue</div>
        </div>
      `,
      choices: [' ']
    };


    var eval_white_car = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
        <div style="width:66%; margin: 0 auto;" class="case-instructions-container">
          <p><strong>Matching Car</strong></p>
          <p>The private detective P. testifies: "Construction Ltd." has asked me to investigate the accident. A CCTV camera, installed at the entrance of the office building, shows a car rapidly leaving a parking space in front of the building at 7:17 p.m. on the evening in question.
          However, the picture was out of focus, so it was not possible to read the license plate. The video shows a white car, a new Tesla.
          Jason Wells drives a new Tesla, which he bought two years ago, and his car is white.
          P has investigated further and estimates the percentage of white Teslas in this area to be 5%.</p>
          <br><br><br>
          <div style="text-align: center;" class="continue-instructions">Press SPACE to continue</div>
        </div>
      `,
      choices: [' ']
    };
    

    var eval_loan_repayment = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
        <div style="width:66%; margin: 0 auto;" class="case-instructions-container">
          <p><strong>Loan Repayment</strong></p>
          <p>The detective further testified: he has found out that Jason Wells paid off his bank loan of $4,870 one day after the money had disappeared. The debts had accumulated in the last three months, and the bank had already threatened to take legal action.
          The defendant explains that he took out the loan to help his sister-in-law, who runs a flower shop in the neighboring city. She returned the money in cash, which he used to pay back the loan.
          Jason Wells explained that he had no written proof of the cash transfer as cash payments are common practice in the floral business, even for large amounts.</p>
          <br><br><br>
          <div style="text-align: center;" class="continue-instructions">Press SPACE to continue</div>
        </div>
      `,
      choices: [' ']
    };


    var eval_questions_understand = {
      type: jsPsychSurveyLikert,
      questions: [
        {
          prompt: "How easy to understand did you find the text overall?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (totally)"],
          required: true
        },
        {
          prompt: "Were you able to deduce the constellation of characters from the text?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (totally)"],
          required: true
        }
      ],
      button_label: "Continue",
      on_load: function () {
        document.body.style.cursor = 'auto';
      }
    };
    
    
    var eval_evaluation_intro = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
        <div style="text-align: justify;">
          <p>Next, we will ask you to evaluate the evidence introduced.</p>
          <p>As a reminder, here are the pieces of evidence that were brought up in the text.</p>
          <ul style="text-align: left; margin-left: 50px;">
            <li>Access to safe (defendant could access the safe)</li>
            <li>School event (defendant seen at school event across town in different clothes)</li>
            <li>Uncertain witness (person looking like defendant seen at office)</li>
            <li>Matching car (car matching the defendants' seen speeding away)</li>
            <li>Loan repayment (loan paid off in cash)</li>
          </ul>
          <br>
          <div style="text-align: center;" class="continue-instructions">Press SPACE to continue</div>
        </div>
      `,
      choices: [' ']
    };

    var eval_safe_questions = {
      type: jsPsychSurveyLikert,
      preamble: '<h3>1. Access to safe (defendant could access the safe)</h3>',
      questions: [
        {
          prompt: "How important is this evidence for determining the outcome of a legal case?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
          required: true
        },
        {
          prompt: "How difficult to understand did you find this evidence?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
          required: true
        },
        {
          prompt: "To what degree do you find it unclear what this evidence means?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
          required: true
        },
        {
          prompt: "To what degree was this evidence in conflict with other evidence presented?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
          required: true
        }
      ],
    };
    
    var eval_school_questions = {
      type: jsPsychSurveyLikert,
      preamble: '<h3>2. School event (defendant seen at school event across town in different clothes)</h3>',
      questions: [
        {
          prompt: "How important is this evidence for determining the outcome of a legal case?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
          required: true
        },
        {
          prompt: "How difficult to understand did you find this evidence?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
          required: true
        },
        {
          prompt: "To what degree do you find it unclear what this evidence means?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
          required: true
        },
        {
          prompt: "To what degree was this evidence in conflict with other evidence presented?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
          required: true
        }
      ],
      button_label: "Continue",
    };


    var eval_witness_questions = {
      type: jsPsychSurveyLikert,
      preamble: '<h3>3. Uncertain witness (person looking like defendant seen at office)</h3>',
      questions: [
        {
          prompt: "How important is this evidence for determining the outcome of a legal case?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
          required: true
        },
        {
          prompt: "How difficult to understand did you find this evidence?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
          required: true
        },
        {
          prompt: "To what degree do you find it unclear what this evidence means?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
          required: true
        },
        {
          prompt: "To what degree was this evidence in conflict with other evidence presented?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
          required: true
        }
      ],
      button_label: "Continue",
    };

  
    var eval_car_questions = {
      type: jsPsychSurveyLikert,
      preamble: '<h3>4. Matching car (car matching the defendants&#39; seen speeding away)</h3>',
      questions: [
        {
          prompt: "How important is this evidence for determining the outcome of a legal case?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
          required: true
        },
        {
          prompt: "How difficult to understand did you find this evidence?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
          required: true
        },
        {
          prompt: "To what degree do you find it unclear what this evidence means?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
          required: true
        },
        {
          prompt: "To what degree was this evidence in conflict with other evidence presented?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
          required: true
        }
      ],
      button_label: "Continue",
    };
  
  
    var eval_loan_questions = {
      type: jsPsychSurveyLikert,
      preamble: '<h3>5. Loan repayment (loan paid off in cash)</h3>',
      questions: [
        {
          prompt: "How important is this evidence for determining the outcome of a legal case?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
          required: true
        },
        {
          prompt: "How difficult to understand did you find this evidence?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
          required: true
        },
        {
          prompt: "To what degree do you find it unclear what this evidence means?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
          required: true
        },
        {
          prompt: "To what degree was this evidence in conflict with other evidence presented?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
          required: true
        }
      ],
      button_label: "Continue",
    };


    var eval_legal_questions = {
      type: jsPsychSurveyLikert,
      questions: [
        {
          prompt: "Did the format as a legal file bother you while reading the text?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (totally)"],
          required: true
        },
        {
          prompt: "Would you find this case interesting if it was in a courtroom drama on TV?",
          labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (totally)"],
          required: true
        }
      ],
      button_label: "Continue",
    };
    

    var eval_outro = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
        <div style="text-align: center;">
          <p>Let's move on to the next text!</p>
          <p>Please read the text carefully. It may consist of several pages.</p>
          <p>Once you have read the text, we will ask you some questions about it.</p>
          <br><br>
          <div class="continue-instructions">Press SPACE to continue</div>
        </div>
      `,
      choices: [' ']
    };

    ///////
    /////// DISTRACTORS Part 2
    ///////


    var distractors2_drama = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
          <div style="display: flex;font-family: 'Times New Roman', Times, serif; justify-content: center; gap: 10px; line-height: 1.6; text-align: justify; width: 100%">
      
            <!-- Left Column -->
            <div style="width: 55%;">
              <p><em>Enter Pisanio reading of a letter</em></p>
              <p>PISANIO</p>
              <p>How? Of adultery? Wherefore write you not<br>
              What monsters her accuse? Leonatus,<br>
              O master, what a strange infection<br>
              Is fall'n into thy ear! What false Italian,</p>
              
              <p>As poisonous-tongued as handed, hath prevailed<br>
              On thy too ready hearing? Disloyal? No.<br>
              She's punished for her truth and undergoes<br>
              More goddesslike than wifelike, such assaults<br>
              As would take in some virtue. O my master!</p>

              <p>Thy mind to her is now as low as were<br>
              Thy fortunes. How? That I should murder her?<br>
              Upon the love and truth and vows which I<br>
              Have made to thy command? I her? Her blood?<br>
              If it be so to do good service, never</p>

              <p>Let me be counted serviceable. How look I<br>
              That I should seem to lack humanity<br>
              So much as this fact comes to?</p>
            </div>
      
            <!-- Right Column -->
            <div style="width: 55%;">
      
              <p><em>(&#8988 He reads: &#8989) Do 't!</em></p>
              <p><em>The letter</em></p>
              <p><em>That I have sent her, by her own command,<br>
              Shall give thee opportunity.</em> O damned paper,<br>
              Black as the ink that's on thee! Senseless bauble, <br>
              Art thou a fedary for this act, and look'st <br>
              So virginlike without? Lo, here she comes.
              </p>
      
              <p><em>Enter Imogen</em></p>
              <p>IMOGEN</p>
              <p>I am ignorant in what I am commanded. <br>
              PISANIO</p>
              <p>Madam, here is a letter from my lord.<br>
              <em>               &#8988 He gives her a paper. &#8989</em></p>
              <p>IMOGEN</p>
              <p>Who, thy lord that is my lord, Leonatus?</p>
            </div>
      
          </div>
          <br>
          <div style="text-align: center;" class="continue-instructions">Press SPACE to continue</div>
        `,
        choices: [' ']
      };


      var distractors2_drama_questions = {
        type: jsPsychSurveyLikert,
        questions: [
          {
            prompt: "How easy to understand did you find the text overall?",
            labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (totally)"],
            required: true
          },
          {
            prompt: "Were you able to deduce the constellation of characters from the text?",
            labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (totally)"],
            required: true
          },
          {
            prompt: "Did the format as a drama bother you while reading the text?",
            labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (totally)"],
            required: true
          },
          {
            prompt: "Would you find this case interesting if it was in a courtroom drama on TV?",
            labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (totally)"],
            required: true
          }
        ],
        button_label: "Continue",
      };


      var distractors2_drama_questions2 = {
        type: jsPsychSurveyLikert,
        questions: [
          {
            prompt: "Would the plot interest you more if it were set in the present?",
            labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (totally)"],
            required: true
          },
          {
            prompt: "To what extent do you agree with the following statement: A soldier should carry out every order given by a superior.",
            labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (totally)"],
            required: true
          },
          {
            prompt: "To what extent do you think it is justified that Pisanio hesitates to carry out his master's order?",
            labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (totally)"],
            required: true
          },
          {
            prompt: "To what extent do you agree with the following statement: Pisanio is in love with Imogen.",
            labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (totally)"],
            required: true
          }
        ],
        button_label: "Continue",
      };

      var distractors2_outro = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
          <div style="text-align: center;">
            <p>This was all for Part 1 of the study.</p>
            <p>Let's move on to the second part.</p>
            <br><br>
              <div class="continue-instructions">Press SPACE to continue</div>
          </div>
        `,
        choices: [' ']
      };    
      
      
    ///////
    /////// INTRO Legal Frame
    ///////


    var reasonabledoubt_explain = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
      <div style="text-align: justify; width:66%; margin: 0 auto;" class="case-instructions-container">
        <p><b>Reasonable Doubt</b></p>
        <p>For this next task, we would like you to learn about the concept of <b> reasonable doubt</b>. This is an important principle when judgments are made in criminal court cases. <br>
         In such cases, a jury is asked to decide whether the defendant is <span style="color:rgb(2, 91, 207); font-weight: bold;">guilty as charged.</span></p>
        <p style="margin-left: 40px;">
          If the members of the jury are <span style="color:rgb(2, 91, 207); font-weight: bold;">convinced</span> that the defendant has committed the crime, then they have to pronounce the defendant
           <span style="color: rgb(2, 91, 207); font-weight: bold;">guilty</span>.
          <br><br>
          Otherwise, they have to pronounce the defendant <span style="color: rgb(2, 91, 207); font-weight: bold;">not guilty</span>.
        </p>
        <p>In a criminal case, the defendant is protected by the presumption of innocence. The defendant should only be convicted if the evidence is so convincing that
         there is <span style="color: rgb(2, 91, 207); font-weight: bold;">no "reasonable doubt"</span> that the person is guilty. Proof "beyond a reasonable doubt" is proof that 
         leaves the jury firmly convinced that the defendant is guilty. It is not required to prove guilt beyond all possible doubt. A "reasonable doubt" is a doubt 
         based upon reason and common sense and is not based purely on speculation. It may arise from a careful and impartial consideration of all the evidence, or from 
         lack of evidence.</p>
        <p>If, after a careful and impartial consideration of all the evidence, a jury member is <span style="color: rgb(2, 91, 207); font-weight: bold;">not convinced beyond reasonable 
        doubt</span> that the defendant is guilty, it is their duty to find the defendant <span style="color: rgb(2, 91, 207); font-weight: bold;">not guilty</span>. On the other
         hand, if, after a careful and impartial consideration of all the evidence, a jury member is <span style="color: rgb(2, 91, 207); font-weight: bold;">convinced beyond a reasonable
          doubt</span> that the defendant is guilty, it is their duty to find the defendant <span style="color: rgb(2, 91, 207); font-weight: bold;">guilty</span>.</p>
        <br><br>
        <div class="continue-instructions">Press SPACE to continue</div>
      </div>
      `,  
      choices: [' ']
    };


      var case_explain_evidence = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
          <div style="text-align: justify; width:66%; margin: 0 auto;" class="case-instructions-container">
            <p>In the next task, the evidence for a criminal case is presented. All witnesses were sworn to tell the truth and informed that they commit perjury if they do not tell the truth.</p>
            <p>The information about the case is presented to you only once. It will be read out to you. Therefore, please listen carefully.</p>
           <br>
            <div class="continue-instructions">Press SPACE to continue.</div>
          </div>
        `,
        choices: [' ']
      };

      


    ///////
    /////// SET UP WEBCAM AND EYE-TRACKING
    ///////

    // INITIATLIZE CAMERA
    var init_camera = {
      type: jsPsychWebgazerInitCamera,
      on_finish: function() {
          if (calibration_mode == 'view') {
              document.body.style.cursor = 'none';
          }
      }
  };

    // CALIBRATION INSTRUCTION 
    var calibration_instructions = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
      <div>
             <font size = 4px font color = "black">      <p> Next, we need to set up your webcam.</p>
             <p> You need to help the camera get a good view of your eyes. To do that, it's <b>IMPORTANT</b> that you follow these rules: <br/> <br/> <br/></font>
             <img height="200px" width="1000px" src="img/instruct1.png"><br/>
             <br><br/>
            Keep lights in front of you. No windows or lamps behind you. <br/> <br/>
             <br><br/>
             On the next page, you will start the eye tracking. Use the rules above.                 <br><br/>
             <div>
                After that, you will teach the computer to track your eyes.<br/>
                You will see a <b>black circle</b> on the screen.<br/>
                Look directly at each circle until it goes away.<br/>
                Then, <b>move your eyes</b> to look at the next circle, and repeat.<br/>
          <br>
             <font   >Press <b>SPACE</b> to start eye tracking! </font></div
      `,
      choices: [' '],   
      post_trial_gap: 500
    };

    // CALIBRATION PROCEDURE
    var calibration = {
      type: jsPsychWebgazerCalibrate,
      calibration_points: [[90,10], [10,90] ,[10,10], [50,50], [25,25], [25,75], [75,25], [75,75], [90,90]],
      repetitions_per_point: 1 ,
      calibration_mode: 'view',
      time_per_point: 2000, 
      randomize_calibration_order: true,
    };

    // VALIDATION INSTRUCTIONS
    var validation_instructions = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
        <p>Let's check if this worked. </p>
        <p>Keep your head still. Move your eyes to look at each circle.</p>
        Press <b>SPACE</b> to continue!`,
      choices: [' '],
      post_trial_gap: 500
    };

    // VALIDATION PROCEDURE
    var validation_points_array = [[25,25], [25,75], [75,25], 
      [75,75], [25,50], [50,50],
      [75,50], [50,25], [50,75]];
        var validation_points_trial = jsPsych.randomization.shuffle(validation_points_array);

        var validation = {
          type: jsPsychWebgazerValidate,
          validation_points: validation_points_trial.slice(0, 9),
          show_validation_data: false,
          roi_radius: 150,
          validation_duration: 2000,
          dot_threshold: threshold,
          data: {
            task: 'validate'
          },
          on_finish: (data) => {
            console.log("Validation Data:", data.percent_in_roi);
            console.log("Below Threshold Count:", data.percent_in_roi.filter(x => x < threshold).length);
          }
          
        };


    // RECALIBRATE 


    const recalibrateInstruction = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
          <p>The camera setup is a little worse than we'd like for this study.</p> 
          <p>Try adjusting your position a bit (e.g., turn off light sources behind you, move closer to the camera, rest your head on your hand).</p> 
          <p>Let's try training the webcam again.</p> 
          <br></br> <p>When you're ready, press <b>SPACe</b> to continue.</p>
      `,
      choices: [' '],
  }

  var recalibrate = {
    timeline: [recalibrateInstruction, calibration, validation_instructions, validation],
    conditional_function: function(){
      var validation_data = jsPsych.data.get().filter({task: 'validate'}).values()[0];
      var below_threshold_count = validation_data.percent_in_roi.filter(function(x) {
        var minimum_percent_acceptable = threshold;
        return x < minimum_percent_acceptable}).length;
  
        return below_threshold_count/9 >= recalibrate_criterion;
  
      // return validation_data.percent_in_roi.some(function(x){
      //   var minimum_percent_acceptable = threshold;
      //   return x < minimum_percent_acceptable;
      // });
    },
    data: {
      phase: 'recalibration'
    }
  }

        // test cam
        const testcam = {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: `
          <div> Let's test if your camera works.  </br>
           <br></br>
           Press <b>SPACE</b> to continue!</div>`,
          choices: [' '],
          post_trial_gap: 1000
        };

      // Done test cam
      const donetest = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
        <div> You are done with the camera test.  </br>
        You can move around again. We will need the camera again later.
         <br></br>
         Press <b>SPACE</b> to continue!</div>`,
        choices: [' '],
        post_trial_gap: 1000,on_load: function () {
          document.body.style.cursor = 'auto';
        }
      };

        // done et overall
      const done = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
        <div> You are done with this part.  </br>
        You can move around again. 
         <br></br>
         Press <b>SPACE</b> to continue!</div>`,
        choices: [' '],
        post_trial_gap: 1000,
        on_load: function () {
          document.body.style.cursor = 'auto';
        }
      };


    ///////
    /////// ACTUAL TRIAL 
    ///////


    function displayStringsInRandomCells(strings, cellClasses) {
      // Safety check: Make sure we have enough cells for the strings
      if (strings.length > cellClasses.length) {
        console.error("There are more strings than available cells.");
        return;
      }
    
      // Shuffle the cellClasses array and add the instructions for the Keyboard response at the end
      const shuffledClasses = [
        ...jsPsych.randomization.shuffle(cellClasses),
        "label-left",
        "label-right"
      ];
    
      // Add the final instructions to the strings
      const finalStrings = [
        ...strings,
        "guilty: press g",
        "not guilty: press n"
      ];
    
      // Object to store which string appears in which cell
      const stringToCellMapping = [];
    
      // Display each string in its (random) cell, all at once
      for (let i = 0; i < finalStrings.length; i++) {
        let cell = document.querySelector(`.${shuffledClasses[i]}`);
        if (cell) {
          cell.textContent = finalStrings[i];
          stringToCellMapping.push({
            string: finalStrings[i],
            cell: shuffledClasses[i],
          });
        } else {
          console.error(`Cell with class "${shuffledClasses[i]}" not found.`);
        }
      }
    
      console.log(stringToCellMapping);
  
    
      return stringToCellMapping;
    }







    // FIXATION CROSS
    var fixation = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '<p id = "fix" style="font-size:40px;">+</p>',
      choices: "NO_KEYS",
      trial_duration: fixation_duration,
      extensions: [
        {
          type: jsPsychExtensionWebgazer,
          params: {targets: ['#fix']}
        }]
    };


    var blank_screen = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '',
      choices: "NO_KEYS",
      trial_duration: 500,
      extensions: [
        {
          type: jsPsychExtensionWebgazer,
          params: {
            targets: ['#blank'],  
          }
        }]
    };


  // Case Condition 1: No inadmissible evidence. 

  var charge1_no_inadmissible_evidence = {
    type: jsPsychAudioKeyboardResponse,
    stimulus: '../img/1Case.m4a',
    prompt: `
      <div style="text-align: center;">
        <p id="jury_intro">Please listen to the case. <br>
        Listen carefully to all information provided. While you listen, connect what you hear to the keywords below.</p>
        <li>Access to safe</li>
        <li>School event</li>
        <li>Uncertain witness</li>
        <li>Matching car</li>
        <li>Loan repayment</li>
             </div>
    `,
    choices: "NO_KEYS",
    trial_ends_after_audio: false,
trial_duration: 1000,


    data: {
      condition: "condition_1",
    },
  
    // Eye-tracking integration
    extensions: [
      {
        type: jsPsychExtensionWebgazer,
        params: {
          targets: ['#jury_intro', '#charge_heading', '#charge_details', '#call_to_decision'],  
        }
      }
    ],
  };

  var case_decide_1 = {
    type: jsPsychAudioKeyboardResponse,
    stimulus: '../img/instructrole.m4a',
    prompt: `
          <style>
            .jspsych-content {
              max-width: 100%;
              width: 100%;
            }
          </style>
          <div class="background">
            <table style="width: 100vw; height: 100vh; table-layout: fixed;">
              <tr>
                <td id=""></td>
                <td id="top-center" class="top-center"></td>
                <td id=""></td>
              </tr>
              <tr>
                <td id="top-left" class="top-left"></td>
                <td id=""></td>
                <td id="top-right" class="top-right"></td>
              </tr>
              <tr>
                <td id="middle-left" class="middle-left"></td>
                <td id=""></td>
                <td id="middle-right" class="middle-right"></td>
              </tr>   
              <tr>
                <td id=""></td>
                <td id="middle-center" class="middle-center"></td>
                <td id=""></td>
              </tr>           
              <tr style="height: 10vh; border-top: 1px solid black;">
                <td id="label-left" class="label-left"></td>
                <td id=""></td>
                <td id="label-right" class="label-right"></td>
              </tr>
            </table>
          </div>
        `,
    on_load: function() {

      const strings = [
        "access to safe",
        "uncertain witness",
        "matching car",
        "school event",
        "loan repayment"
      ];
      const cellClasses = [
        "top-left",
        "top-center",
        "top-right",
        "middle-left",
        "middle-right"
      ];

      // Store the locations of the strings in the trial's data object using a temporary variable
      jsPsych.getCurrentTrial().strings_and_cells = displayStringsInRandomCells(strings, cellClasses);

    },
    on_finish: function(data) {
      // Save the stored data from the current trial
      data.strings_and_cells = jsPsych.getCurrentTrial().strings_and_cells;
    },
    choices: ['g', 'n'],
    extensions: [
      {
        type: jsPsychExtensionWebgazer, 
        params: { 
          targets: ['#top-left', '#top-center', '#top-right', '#middle-left', '#middle-right'] // Tracking specific cells
        }
      }
    ]
  };

  // Case Condition 2: Inadmissible evidence, no additional instruction. 

  var charge2_inadmissible_no_instructions = {
    type: jsPsychAudioKeyboardResponse,
    stimulus: '../img/10Wiretap.m4a',
    prompt: `
      <div style="text-align: center;">
        <p id="jury_intro">Please listen to the case. <br>
        Listen carefully to all information provided. While you listen, connect what you hear to the keywords below.</p>
        <li>Access to safe</li>
        <li>School event</li>
        <li>Uncertain witness</li>
        <li>Matching car</li>
        <li>Loan repayment</li>
        </div>
    `,
    choices: "NO_KEYS",
    trial_ends_after_audio: false,
trial_duration: 1000,


    data: {
      condition: "condition_2",
    },
  
    extensions: [
      {
        type: jsPsychExtensionWebgazer,
        params: {
          targets: [
            '#jury_intro',
            '#charge_heading',
            '#charge_details',
            '#additional_evidence_intro',
            '#wiretap_evidence',
            '#call_to_decision'
          ],
        }
      }
    ],
  };

  var case_decide_2_4 = {
    type: jsPsychAudioKeyboardResponse,
    stimulus: '../img/instructrole.m4a',
    prompt: `
          <style>
            .jspsych-content {
              max-width: 100%;
              width: 100%;
            }
          </style>
          <div class="background">
            <table style="width: 100vw; height: 100vh; table-layout: fixed;">
              <tr>
                <td id=""></td>
                <td id="top-center" class="top-center"></td>
                <td id=""></td>
              </tr>
              <tr>
                <td id="top-left" class="top-left"></td>
                <td id=""></td>
                <td id="top-right" class="top-right"></td>
              </tr>
              <tr>
                <td id="middle-left" class="middle-left"></td>
                <td id=""></td>
                <td id="middle-right" class="middle-right"></td>
              </tr>   
              <tr>
                <td id=""></td>
                <td id="middle-center" class="middle-center"></td>
                <td id=""></td>
              </tr>           
              <tr style="height: 10vh; border-top: 1px solid black;">
                <td id="label-left" class="label-left"></td>
                <td id=""></td>
                <td id="label-right" class="label-right"></td>
              </tr>
            </table>
          </div>
        `,
    on_load: function() {

      const strings = [
        "access to safe",
        "uncertain witness",
        "matching car",
        "school event",
        "wiretap confession",
        "loan repayment"
      ];
      const cellClasses = [
        "top-left",
        "top-center",
        "top-right",
        "middle-left",
        "middle-center",
        "middle-right"
      ];

      // Store the locations of the strings in the trial's data object using a temporary variable
      jsPsych.getCurrentTrial().strings_and_cells = displayStringsInRandomCells(strings, cellClasses);

    },
    on_finish: function(data) {
      // Save the stored data from the current trial
      data.strings_and_cells = jsPsych.getCurrentTrial().strings_and_cells;
    },
    choices: ['g', 'n'],
    extensions: [
      {
        type: jsPsychExtensionWebgazer, 
        params: { 
          targets: ['#top-left', '#top-center', '#top-right', '#middle-left', "#middle-center", '#middle-right'] // Tracking specific cells
        }
      }
    ]
  };

  // Case Condition 3: Inadmissible evidence, instruction to ignore.

  var charge3_inadmissible_ignore = {
    type: jsPsychAudioKeyboardResponse,
    stimulus: '../img/13WiretapDisregard.m4a',
    prompt: `
      <div class="charge-container">
       <div style="text-align: center;">
        <p id="jury_intro">Please listen to the case. <br>
        Listen carefully to all information provided. While you listen, connect what you hear to the keywords below.</p>
        <li>Access to safe</li>
        <li>School event</li>
        <li>Uncertain witness</li>
        <li>Matching car</li>
        <li>Loan repayment</li>
     </div>
    `,
    choices: "NO_KEYS",
    trial_ends_after_audio: false,
trial_duration: 1000,


    data: {
      condition: "condition_3",
    },

    extensions: [
      {
        type: jsPsychExtensionWebgazer,
        params: {
          targets: [
            '#jury_intro',
            '#charge_heading',
            '#charge_details',
            '#additional_evidence_intro',
            '#wiretap_evidence',
            '#judge_instruction',
            '#ignore_instruction',
            '#call_to_decision'
          ],
        }
      }
    ],
  };

  // Case Condition 4: Inadmissible evidence, instruction about normative background.

  var charge4_inadmissible_normative = {
    type: jsPsychAudioKeyboardResponse,
    stimulus: '../img/14Wireta Normative.m4a',
    prompt: `
      <div style="text-align: center;">
        <p id="jury_intro">Please listen to the case. <br>
        Listen carefully to all information provided. While you listen, connect what you hear to the keywords below.</p>
        <li>Access to safe</li>
        <li>School event</li>
        <li>Uncertain witness</li>
        <li>Matching car</li>
        <li>Loan repayment</li>
        </div>    `,
    choices: "NO_KEYS",
    trial_ends_after_audio: false,
trial_duration: 1000,

  
    data: {
      condition: "condition_4",
    },

    extensions: [
      {
        type: jsPsychExtensionWebgazer,
        params: {
          targets: [
            '#jury_intro',
            '#charge_heading',
            '#charge_details',
            '#additional_evidence_intro',
            '#wiretap_evidence',
            '#judge_instruction',
            '#normative_instruction',
            '#call_to_decision'
          ],
        }
      }
    ],
  };
  

  // Case Condition 5: Inadmissible evidence, instruction to neutralize.

  var charge5_inadmissible_neutralize = {
    type: jsPsychAudioKeyboardResponse,
    stimulus: '../img/15WiretapNeutralize.m4a',
    prompt: `
       <div style="text-align: center;">
        <p id="jury_intro">Please listen to the case. <br>
        Listen carefully to all information provided. While you listen, connect what you hear to the keywords below.</p>
        <li>Access to safe</li>
        <li>School event</li>
        <li>Uncertain witness</li>
        <li>Matching car</li>
        <li>Loan repayment</li>
        </div>    `,
    choices: "NO_KEYS",
    trial_ends_after_audio: false,
trial_duration: 1000,


    data: {
      condition: "condition_5",
    },

    extensions: [
      {
        type: jsPsychExtensionWebgazer,
        params: {
          targets: [
            '#jury_intro',
            '#charge_heading',
            '#charge_details',
            '#additional_evidence_intro',
            '#wiretap_evidence',
            '#judge_instruction',
            '#neutralize_instruction',
            '#call_to_decision'
          ]
        }
      }
    ],
  };


  // Case Survey

  var case_certainty_question = {
    type: jsPsychSurveyLikert,
    preamble: '<p>Please answer the following question:</p>',
    questions: [
      {
        prompt: "How certain are you that you made the right judgment?",
        labels: ["totally uncertain", "", "", "", "", "", "", "", "", "totally certain"],
        required: true
      }
    ],
    button_label: "Continue",
    on_load: function () {
      document.body.style.cursor = 'auto';
    }
  };
  

  var case_probability_estimation = {
    type: jsPsychSurveyHtmlForm,
    preamble: `
      <p>Please answer the following question:</p> 
      <br> <br>
      <p>In your estimation, how high is the probability that Jason Wells has taken the money from the safe?</p>
      <p>Enter your estimate as an integer between 0 and 100:</p>
    `,
    html: `
      <div style="text-align: center;">
        <input type="number" id="estimate" name="estimate" min="0" max="100" required style="width: 80px;"> percent
      </div>
      <br>
    `,
    button_label: "Continue",
  };
  

  var case_threshold_question = {
    type: jsPsychSurveyHtmlForm,
    preamble: `
      <p>Please answer the following question:</p>
      <br> <br>
      <p>Independently of the judgment you just made, how high would the likelihood of Jason Wells taking the money have to be <strong>AT LEAST</strong> for you to judge him guilty in this criminal case?</p>
      <p>Enter your threshold as an integer between 0 and 100:</p>
    `,
    html: `
      <div style="text-align: center;">
        <input type="number" id="threshold" name="threshold" min="0" max="100" required style="width: 80px;"> percent
      </div>
      <br>
    `,
    button_label: "Continue",
  };


  var case_evidence_evaluation_intro = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function() {
      // Retrieve the condition saved in the experiment data
      var condition = jsPsych.data.get().last(1).values()[0].condition;
  
      // Define all possible evidence pieces
      var evidence_list = [
        "<li>Access to safe (defendant could access the safe)</li>",
        "<li>School event (defendant seen at school event across town in different clothes)</li>",
        "<li>Uncertain witness (person looking like defendant seen at office)</li>",
        "<li>Matching car (car matching the defendants' seen speeding away)</li>",
        "<li>Loan repayment (loan paid off in cash)</li>"
      ];
  
      // Conditionally add the Wiretap evidence if not in 'case_condition_1'
      if (condition !== "condition_1") {
        evidence_list.push("<li>Wiretap (phone call about money)</li>");
      }
  
      // Return the customized stimulus
      return `
        <div style="text-align: justify;">
          <p>Next, we will ask you to evaluate the evidence introduced. As a reminder, here are the pieces 
          of evidence that were brought up in the text:</p>
          <br>
          <ul style="text-align: left; margin-left: 50px;">
            ${evidence_list.join('')}
          </ul>
          <br><br>
          <div style="text-align: center;" class="continue-instructions">Press SPACE to continue</div>
        </div>
      `;
    },
    choices: [' ']
  };

  var case_evaluate_access_to_safe = {
    type: jsPsychSurveyLikert,
    preamble: "1. Access to Safe (defendant could access the safe)",
    questions: [
      {
        prompt: "How important is this evidence for determining the outcome of a legal case?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      },
      {
        prompt: "How difficult to understand did you find this evidence?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      },
      {
        prompt: "To what degree do you find it unclear what this evidence means?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      },
      {
        prompt: "To what degree was this evidence in conflict with other evidence presented?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      }
    ],
    button_label: "Continue"
  };


  var case_evaluate_school_questions = {
    type: jsPsychSurveyLikert,
    preamble: '<h3>2. School event (defendant seen at school event across town in different clothes)</h3>',
    questions: [
      {
        prompt: "How important is this evidence for determining the outcome of a legal case?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      },
      {
        prompt: "How difficult to understand did you find this evidence?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      },
      {
        prompt: "To what degree do you find it unclear what this evidence means?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      },
      {
        prompt: "To what degree was this evidence in conflict with other evidence presented?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      }
    ],
    button_label: "Continue",
  };


  var case_evaluate_witness_questions = {
    type: jsPsychSurveyLikert,
    preamble: '<h3>3. Uncertain witness (person looking like defendant seen at office)</h3>',
    questions: [
      {
        prompt: "How important is this evidence for determining the outcome of a legal case?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      },
      {
        prompt: "How difficult to understand did you find this evidence?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      },
      {
        prompt: "To what degree do you find it unclear what this evidence means?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      },
      {
        prompt: "To what degree was this evidence in conflict with other evidence presented?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      }
    ],
    button_label: "Continue",
  };


  var case_evaluate_car_questions = {
    type: jsPsychSurveyLikert,
    preamble: '<h3>4. Matching car (car matching the defendants&#39; seen speeding away)</h3>',
    questions: [
      {
        prompt: "How important is this evidence for determining the outcome of a legal case?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      },
      {
        prompt: "How difficult to understand did you find this evidence?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      },
      {
        prompt: "To what degree do you find it unclear what this evidence means?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      },
      {
        prompt: "To what degree was this evidence in conflict with other evidence presented?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      }
    ],
    button_label: "Continue",
  };


  var case_evaluate_loan_questions = {
    type: jsPsychSurveyLikert,
    preamble: '<h3>5. Loan repayment (loan paid off in cash)</h3>',
    questions: [
      {
        prompt: "How important is this evidence for determining the outcome of a legal case?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      },
      {
        prompt: "How difficult to understand did you find this evidence?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      },
      {
        prompt: "To what degree do you find it unclear what this evidence means?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      },
      {
        prompt: "To what degree was this evidence in conflict with other evidence presented?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      }
    ],
    button_label: "Continue",
  };

  var case_evaluate_wiretape_questions = {
    type: jsPsychSurveyLikert,
    preamble: '<h3>6. Wiretap (phone call about money)</h3>',
    questions: [
      {
        prompt: "How important is this evidence for determining the outcome of a legal case?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      },
      {
        prompt: "How difficult to understand did you find this evidence?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      },
      {
        prompt: "To what degree do you find it unclear what this evidence means?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      },
      {
        prompt: "To what degree was this evidence in conflict with other evidence presented?",
        labels: ["1 (not at all)", "2", "3", "4", "5", "6", "7 (extremely)"],
        required: true
      }
    ],
    button_label: "Continue",
  };


  var goodbye_trial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <p>Thanks!<p>
      <p> You're done with the study.</p>
      <br><br><br><br>
      <div class="continue-instructions">Press SPACE to continue</div>`
  }


var success_guard = {
  type: jsPsychCallFunction,
  func: () => {successExp = true}
};
  

  function startExp() {

    /* create timeline */
    var timeline = [];

    // adding the trials to the timeline

    timeline.push(preload);
    timeline.push(fullscreenEnter);

    timeline.push(testcam);
    timeline.push(calibration_instructions);
    timeline.push(init_camera);
    timeline.push(calibration);
    timeline.push(validation_instructions);
    timeline.push(validation);
    timeline.push(recalibrate);
    timeline.push(donetest);

    timeline.push(audio_word_entry);
    timeline.push(check_word_trial);
    timeline.push(demographics_questionnaire);
    timeline.push(introduction);

    timeline.push(distractors_instructions);
    timeline.push(distractors_story_1);
    timeline.push(distractotors_questions_1);
    timeline.push(distractotors_questions_2);
    timeline.push(distractotors_questions_3);
    timeline.push(distractors_outro);

    timeline.push(charge_screen);
    timeline.push(eval_access_to_the_safe);
    timeline.push(eval_school_event);
    timeline.push(eval_uncertain_witness);
    timeline.push(eval_white_car);
    timeline.push(eval_loan_repayment);
    timeline.push(eval_questions_understand);
    timeline.push(eval_evaluation_intro);
    timeline.push(eval_safe_questions);
    timeline.push(eval_school_questions);
    timeline.push(eval_witness_questions);
    timeline.push(eval_car_questions);
    timeline.push(eval_loan_questions);
    timeline.push(eval_legal_questions);
    timeline.push(eval_outro);

    timeline.push(distractors2_drama);
    timeline.push(distractors2_drama_questions);
    timeline.push(distractors2_drama_questions2);
    timeline.push(distractors2_outro);
    timeline.push(reasonabledoubt_explain);
    timeline.push(case_explain_evidence);

    timeline.push(calibration_instructions);
    timeline.push(init_camera);
    timeline.push(calibration);
    timeline.push(validation_instructions);
    timeline.push(validation);
    timeline.push(recalibrate);


    // Randomly add one of the five conditions

    // Put all trials in an array
    var trials = [
      //charge1_no_inadmissible_evidence,
      charge2_inadmissible_no_instructions,
      charge3_inadmissible_ignore,
      charge4_inadmissible_normative,
      charge5_inadmissible_neutralize
    ];

    // Randomly select one trial
    var selected_trial = jsPsych.randomization.sampleWithoutReplacement(trials, 1)[0];

    // Add the selected trial, fixation, and the appropriate decision phase
    timeline.push(selected_trial, blank_screen, fixation);

    // Conditionally add the correct decision phase
    if (selected_trial === charge1_no_inadmissible_evidence) {
      timeline.push(case_decide_1);  // For Condition 1
    } else {
      timeline.push(case_decide_2_4);  // For Conditions 2–5
    }

    timeline.push(case_certainty_question);
    timeline.push(case_probability_estimation);
    timeline.push(case_threshold_question);
    timeline.push(done);
    timeline.push(case_evidence_evaluation_intro);
    timeline.push(case_evaluate_access_to_safe);
    timeline.push(case_evaluate_school_questions);
    timeline.push(case_evaluate_witness_questions);
    timeline.push(case_evaluate_car_questions);
    timeline.push(case_evaluate_loan_questions);


    if (selected_trial !== "charge1_no_inadmissible_evidence") {
      timeline.push(case_evaluate_wiretape_questions);
    }


    timeline.push(goodbye_trial);

    timeline.push(success_guard);

    jsPsych.run(timeline);

  }
  