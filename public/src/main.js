 /// TO DOS! 
 /// Do you want to change the Word Rating Task so it includes only the used words, not all possible words?!   
    
    
 

    ///////
    /////// EXPERIMENT SETUP
    ///////


   /* preload images */
    var preload = {
      type: jsPsychPreload,
      images: [
        '../img/image1.png', 
        '../img/image2.png', 
        '../img/image3.png',
        '../img/image4.png',
        '../img/image5.png',
        '../img/image6.png',
        '../img/instruct0.png',
        '../img/instruct1.png',
        '../img/instruct3.png']
    };

    var fixation_duration = 500;
    var successExp = false;
    var resize_screen = false;
    var point_size = 50;
    var threshold = 0.7; // at least 70% of gazes must be inside a given ROI to be considered accurate (threshold)
    var recalibrate_criterion = 0.222; // if at least 2 ROIs (2 points out of 9 total points shown = 0.22) are below the threshold set above, this will trigger recalibration in the initial validation phases (not while the task is running)
    var calibration_mode = 'view';

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

    var jsPsych = initJsPsych({
      override_safe_mode: true,
      extensions: [
        {type: jsPsychExtensionWebgazer}
      ], 
      on_finish: () => on_finish_callback(),
      on_close: () => on_finish_callback(),
      on_trial_finish: function () {if(successExp) {
        closeFullscreen();
        document.body.style.cursor = 'auto';
        var randomCode = jsPsych.randomization.randomID(7);
        jsPsych.endExperiment(`<div>
            Danke für Ihre Teilnahme an der Studie! 
            <br> <br>
            Ihr anonymer Teilnahme-Code lautet ${randomCode1}POW${randomCode2}.
            <br> <br> 
            Um Versuchspersonenstunden an der Universität Heidelberg zu erhalten:
            <br> Bitte senden Sie diesen Code per Mail an die 
            Studienleiterin Pernilla Bandick
            <br> via <a href="mailto:pernilla.bandick@stud.uni-heidelberg.de">pernilla.bandick@stud.uni-heidelberg.de</a>. 
            
            <br> <br>Sie können das Fenster danach schließen.
                     
                     
        </div>`);
        }
    }
    });

    var subject_id = jsPsych.randomization.randomID(7);
    
    var wordlist = [[],[]];
    var used_words = [[],[]];
    

    const trials = 60;

    var count = trials;
    var word = "";

    var treatment = jsPsych.randomization.shuffle(["free_sampling", "regular_ec"])[0];

    fetch("wordlist_negative.txt")
        .then((r) => r.text())
        .then((text) => {
            wordlist[0] = jsPsych.randomization.shuffle(text.match(/\S+/g));
            console.log(wordlist[0].length)
        })
        

    fetch("wordlist_positive.txt")
        .then((r) => r.text())
        .then((text) => {
            wordlist[1] = jsPsych.randomization.shuffle(text.match(/\S+/g));
            console.log(wordlist[1].length)
        })

        let allWords = wordlist[0].concat(wordlist[1]);
        allWords = jsPsych.randomization.shuffle(allWords);    
    const associations = jsPsych.randomization.shuffle([0, 0, 0, 1, 1, 1]);



    // Define the image stimuli and associations
    const images = jsPsych.randomization.shuffle([
        { image: 'img/image1.png', association: associations[0] },
        { image: 'img/image2.png', association: associations[1] },
        { image: 'img/image3.png', association: associations[2] },
        { image: 'img/image4.png', association: associations[3] },
        { image: 'img/image5.png', association: associations[4] },
        { image: 'img/image6.png', association: associations[5] },
    ]);

    // Randomize the positions for each subject
    const positions = jsPsych.randomization.shuffle([
        { left: '50%', top: '20%' },
        { left: '80%', top: '35%' },
        { left: '80%', top: '65%' },
        { left: '50%', top: '80%' },
        { left: '20%', top: '65%' },
        { left: '20%', top: '35%' }
    ]);

    // Randomize the positions for each subject
    const left_right = jsPsych.randomization.shuffle(['25%','75%']);

    jsPsych.data.addProperties({
        image1: images[0].image,
        image2: images[1].image,
        image3: images[2].image,
        image4: images[3].image,
        image5: images[4].image,
        image6: images[5].image,
        image1_association: images[0].association,
        image2_association: images[1].association,
        image3_association: images[2].association,
        image4_association: images[3].association,
        image5_association: images[4].association,
        image6_association: images[5].association,
        position1_left: positions[0].left,
        position1_top: positions[0].top,
        position2_left: positions[1].left,
        position2_top: positions[1].top,
        position3_left: positions[2].left,
        position3_top: positions[2].top,
        position4_left: positions[3].left,
        position4_top: positions[3].top,
        position5_left: positions[4].left,
        position5_top: positions[4].top,
        position6_left: positions[5].left,
        position6_top: positions[5].top,
        negative_position: left_right[0],
        positive_position: left_right[1],
        treatment: treatment
    });


    stimuli_data = jsPsych.randomization.shuffle(stimuli_data);
    console.log(stimuli_data);

    stimuli_data_r1 = jsPsych.randomization.shuffle(stimuli_data_r1);

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


       ///////
    /////// SET UP WEBCAM AND EYE-TRACKING
    ///////

    // INITIATLIZE CAMERA

    const init_camera = {
      type: jsPsychWebgazerInitCamera,
      on_finish: function() {
          if (calibration_mode == 'view') {
              document.body.style.cursor = 'none';
          }
      }
  };


  const eyeTrackingInstruction1 = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
          <div> <font size=120%; font color = 'green';>Webcam Webcam Einstellung </font><br/>
          <br><br/>
          Bevor wir mit der nächsten Aufgabe beginnen, müssen wir Ihre Webcam für das Eye-Tracking aktivieren und einstellen. <br/> 
          Dabei bringen Sie der Webcam bei, Ihre Blicke zur erkennen. <br/> 
          <br><br/> 
          Dafür sehen Sie eine Reihe von Punkten auf dem Bildschirm. <br/> 
          Ihre Aufgabe besteht darin, jeden Punkt direkt anzusehen, bis er verschwindet. <br/> 
          Schauen Sie dann zum nächsten Punkt und wiederholen Sie den Vorgang. <br/> 
          <br/> 
          <br><br/> 
          Wenn Sie bereit sind, drücken Sie die <b>LEERTASTE</b>, um fortzufahren.  </div>
      `,
      post_trial_gap: 500,
      choices: [' '],

  };

  const eyeTrackingInstruction2 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        Wir müssen nun erneut die Webcam checken.
        <br><br/>
        Wenn Sie bereit sind, drücken Sie die <b>LEERTASTE</b>, um fortzufahren.
    `,
    post_trial_gap: 500,
    choices: [' '],

};

const eyeTrackingNote = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
      <div><font size=120%; font color = 'green';>Webcam Einstellungen</font><br/>
      <br><br>
      <font size = 5px font color = "darkred">Es gibt mehrere <b>WICHTIGE</b> Tipps, die Ihnen helfen, die Webcam bestmöglich zu benutzen:<br/></font> 
      <img height="200px" width="1000px" src="img/instruct1.png"><br/> 
      <br><br> 
      <div style="text-align:left"> Zusätzlich zu den Tipps in der Abbildung: <br> 
      (1). Verwenden Sie Ihre Augen, um sich auf dem Bildschirm umzusehen, und versuchen Sie, Kopfbewegungen zu vermeiden. <br/> 
      (2). Stellen Sie sicher, dass Lichtquellen vor Ihnen und nicht hinter Ihnen sind, damit die Webcam Ihr Gesicht klar erkennen kann. Vermeiden Sie z.B. eine Fenster hinter sich. <br/> 
      (3). Nachdem Sie diese Anpassungen vorgenommen haben, überprüfen Sie erneut, ob Ihr Gesicht gut in das Kästchen im Videobild passt und dass das Kästchen grün ist.<br/>
      </div>
      <br><br/>
      <br><br/>
      <font size=5px; >Wenn Sie bereit sind, drücken Sie die <b>LEERTASTE</b>, um fortzufahren.</font></div>
  `,
  post_trial_gap: 500,
  choices: [' '],
};

const calibrationInstruction= {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
      <div>
          Es kann bis zu 30 Sekunden dauern, bis die Kamera initialisiert ist. <br/>
          <br><br/>
          Wenn Sie bereit sind, drücken Sie die <b>LEERTASTE</b>, um fortzufahren.
      </div>
  `,
  post_trial_gap: 500,
  choices: [' '],
  on_finish: () => document.body.style.cursor = 'pointer',
};



    // CALIBRATION PROCEDURE
    const calibration = {
      type: jsPsychWebgazerCalibrate,
      calibration_points: [[90,10], [10,90] ,[10,10], [50,50], [25,25], [25,75], [75,25], [75,75], [90,90]],
      repetitions_per_point: 1 ,
      calibration_mode: 'view',
      time_per_point: 2000, 
      randomize_calibration_order: true,
    };

    // VALIDATION INSTRUCTIONS
    const validationInstruction = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus:`
          <div>  Nun messen wir die Genauigkeit der Einstellungen. <br/>
          <br><br/>
          Blicken Sie der Reihe nach auf die schwarzen Punkte, bis sie verschwinden.
          <br><br/>
          Wenn Sie bereit sind, drücken Sie die <b>LEERTASTE</b>, um fortzufahren. </div>
      `,
      choices: [' '],
      post_trial_gap: 1000,
      on_finish: () =>  document.body.style.cursor = 'none',
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
          <p>Die Genauigkeit ist etwas niedriger als für diese Studie notwendig.</p>
          <p>Lassen Sie uns die Webcam noch einmal trainieren.</p>
          <br></br>
          <p>Wenn Sie bereit sind, drücken Sie die <b>LEERTASTE</b>, um fortzufahren.  </p>
      `,
      choices: [' '],
  }

  var recalibrate = {
    timeline: [recalibrateInstruction, calibration, validationInstruction, validation],
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

    // RECALIBRATION AT CERTAIN TRIALS
    const cali_vali_instructions = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
      <div>Wir müssen die Webcam noch einmal einstellen.  </br>
      Blicken Sie wie zuvor auf die schwarzen Punkte.
      <br> Schauen Sie mit den Augen, bewegen Sie nicht Ihren Kopf.</br>
       <br></br>
       Press <b>SPACE</b> to begin!</div>`,
      choices: [' '],
      post_trial_gap: 1000
    };

    // FIXATIONS TO CALIBRATE
    const fixation_cali = {
        type: jsPsychWebgazerCalibrate,
        calibration_points: [[90,10], [10,90] ,[10,10], [50,50], [25,25], [25,75], [75,25], [75,75], [90,90]],
        repetitions_per_point: 1,
        calibration_mode: 'view',
        time_per_point: 2500, 
        randomize_calibration_order: true,
      };

    // FIXATIONS TO VALIDATE
    const fixation1 = {
        type: jsPsychWebgazerValidate,
        validation_points: [[25,25], [25,75], [75,25], [75,75]],
        show_validation_data: false,
        roi_radius: 150,
        validation_duration: 2000,
        on_finish: (data) => console.log("acc: ",data.percent_in_roi),
        on_start: (fixation1) => fixation1.validation_points = jsPsych.randomization.shuffle(validation_points_array).slice(0,3)
      };




    

// **********************
// ****** Trials ********
// **********************

    ///////
    /////// PRELIMINARY INSTRUCTIONS
    ///////

    var glasses_screening = {
      type: jsPsychHtmlButtonResponse,
      stimulus: `
          <p> In der aktuellen Studie ist eines unserer Ziele, Augenbewegungen zu untersuchen. 
              <br>Brillen machen dies oft unmöglich, da es zu Reflexionen auf den Gläsern kommt. 
              <br>Sie können daher nur teilnehmen, wenn Sie KEINE Brille tragen. 
              <br>Es ist in Ordnung teilzunehmen, wenn Sie Ihre Brille jetzt abnehmen können und trotzdem sehr kleinen Text auf dem Bildschirm lesen können.
              <br><br> <div style="font-size: 10px !important;">Wenn Sie dies OHNE Brille nicht lesen können, können Sie nicht teilnehmen!</div> 
              <br><br>Bitte seien Sie ehrlich und geben Sie unten an, ob Sie teilnehmen können oder nicht.  
              <br><br><br>Bitte bestätigen Sie, dass Sie keine Brille tragen und an dieser Studie teilnehmen können.</p>
        `,
choices: ['Keine Brille auf und kann teilnehmen.', 'Brille auf und kann nicht teilnehmen.'],
      required: true,
      on_finish: function(data) {
          // Check if the answer is "Cannot take part"
          if (data.response === 1) {  // 0 corresponds to the first button ("Yes")
              // If they are wearing glasses, redirect and end the experiment
              window.location.href = "https://www.psychologie.uni-heidelberg.de";  // Redirect to 
          } else {
              // Otherwise, continue with the experiment
              console.log("Participant chose no glasses, continuing the experiment.");
          }
      },
      data: {
        name: 'glasses_screening'
      }
  };

    

    /** full screen */
    var fullscreenEnter = {
      type: jsPsychFullscreen,
      message: `<div> Für diese Studie ist es notwendig in den Vollbildmodus, zu wechseln.  <br/> 
      Bevor wir dies tun, schließen Sie bitte nun alle anderen Programme und Browsertabs.  <br/> 
      Dies hilft uns dabei, sicherzustellen, dass die Studie reibungslos abläuft und Sie ungestört bleiben. <br/> 
          <br><br/> 
          Sobald die Studie gestartet ist, <b>VERLASSEN SIE NICHT</b> den Vollbildmodus.  <br/> 
          Andernfalls wird die Studie automatisch beendet. <br/> 
          <br><br/> 
          Wenn Sie bereit sind zu beginnen, klicken Sie auf den Button<br> <br></div>
    `,
      button_label: "Vollbildmodus starten",
      fullscreen_mode: true,
      on_finish: function () {
      //   document.body.style.cursor = 'none'
      window.onresize = resize
      function resize() {
        if(successExp && !resize_screen){
          resize_screen = false;
          console.log("end experiment resize");
        } else{
          resize_screen = true;
          console.log("Resized!");
          alert("Sie haben den Vollbildmodus verlassen! Die Studie wurde automatisch abgebroche.");
          // location.reload(true);
          // window.location.href = window.location;
          window.location.href = "../views/failed.html";
          
        }
      }
    }
    };


///////////////////////////////////////////////////////////////////////////////////////////////////
//Emotion Regulation Questionnaire ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

       // Define the Likert scale labels
       var ERQ_scale_labels = [
        "1 <br> stimmt überhaupt nicht",
        "2 <br>   ",
        "3 <br>  ",
        "4 <br>  neutral",
        "5 <br>  ",
        "6 <br>  ",
        "7 <br>  stimmt vollkommen"
      ];


    var ERQ_pageone = {
      type: jsPsychSurveyLikert,
      preamble:`
       <p>Wir möchten Ihnen zu Beginn gerne einige Fragen zu Ihren Gefühlen stellen. <br>
          Uns interessiert, wie Sie Ihre Gefühle unter Kontrolle halten, bzw. regulieren. <br>
          Zwei Aspekte Ihrer Gefühle interessieren uns dabei besonders. <br>
          Einerseits ist dies Ihr emotionales Erleben, also was Sie innen fühlen. <br>
          Andererseits geht es um den emotionalen Ausdruck, also wie Sie Ihre Gefühle verbal, <br>
          gestisch oder im Verhalten nach außen zeigen. <br>
          <br>
          Obwohl manche der Fragen ziemlich ähnlich klingen, unterscheiden sie sich in wesentlichen Punkten.<br>
          Bitte beantworten Sie die Fragen, indem Sie die Antwortmöglichkeiten anklicken.
          </p>
      `,
       questions: [
        {prompt: "Wenn ich mehr positive Gefühle (wie Freude oder Heiterkeit) empfinden möchte, ändere ich, woran ich denke.", name: 'ERQ1', labels: ERQ_scale_labels, required: true},
        {prompt: "Ich behalte meine Gefühle für mich.", name: 'ERQ2', labels: ERQ_scale_labels, required: true},
        {prompt: "Wenn ich weniger negative Gefühle (wie Traurigkeit oder Ärger) empfinden möchte, ändere ich, woran ich denke.", name: 'ERQ3', labels: ERQ_scale_labels, required: true},
        ],
      randomize_question_order: false, 
      button_label: "Weiter" ,
    };
  
    var ERQ_pagetwo= {
      type: jsPsychSurveyLikert,
      preamble: "Bitte beantworten Sie die weiteren Fragen, indem Sie die Antwortmöglichkeiten anklicken.",
      questions: [
        {prompt: "Wenn ich positive Gefühle empfinde, bemühe ich mich, sie nicht nach außen zu zeigen.", name: 'ERQ4', labels: ERQ_scale_labels, required: true},
        {prompt: "Wenn ich in eine stressige Situation gerate, ändere ich meine Gedanken über die Situation so, dass es mich beruhigt.", name: 'ERQ5', labels: ERQ_scale_labels, required: true},
        {prompt: "Ich halte meine Gefühle unter Kontrolle, indem ich sie nicht nach außen zeige.", name: 'ERQ6', labels: ERQ_scale_labels, required: true},
        {prompt: "Wenn ich mehr positive Gefühle empfinden möchte, versuche ich über die Situation anders zu denken.", name: 'ERQ7', labels: ERQ_scale_labels, required: true},
      ],
      randomize_question_order: false, 
      button_label: "Weiter" ,
    };
  
  
    var ERQ_pagethree = {
      type: jsPsychSurveyLikert,
      preamble: "Bitte beantworten Sie die weiteren Fragen, indem Sie die Antwortmöglichkeiten anklicken.",
      questions: [
        {prompt: "Ich halte meine Gefühle unter Kontrolle, indem ich über meine aktuelle Situation anders nachdenke.", name: 'ERQ8', labels: ERQ_scale_labels, required: true},
        {prompt: "Wenn ich negative Gefühle empfinde, sorge ich dafür, sie nicht nach außen zu zeigen.", name: 'ERQ9', labels: ERQ_scale_labels, required: true},
        {prompt: "Wenn ich weniger negative Gefühle empfinden möchte, versuche ich über die Situation anders zu denken.", name: 'ERQ10', labels: ERQ_scale_labels, required: true},
      ],
      randomize_question_order: false, 
      button_label: "Weiter" ,
    };



///////////////////////////////////////////////////////////////////////////////////////////////////
//Baseline Evaluation ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////


    const evaluation1_intro = {
      type: jsPsychHtmlButtonResponse,
      stimulus: `
          <p>
             
              Im Alltag bewerten wir ständig unterschiedlichste Dinge – seien es Produkte, Situationen oder Personen, die wir mehr oder weniger bewusst einschätzen. 
              <br>
              Diese Studie zielt darauf ab, besser zu verstehen, wie solche Bewertungen entstehen. 
              
              <br><br>
              
              Im Folgenden bitten wir Sie daher, farbige Quadrate zu beurteilen. 

              <br><br>

              Sie werden nun 6 Quadrate in verschiedenen Farben sehen. 
              <br>Geben Sie bitte an, wie positiv oder negativ Ihre emotionalen Reaktionen auf die farbigen Quadrate sind. 

              <br><br>

              Dabei gibt es keine richtigen oder falschen Antworten. Es kommt uns nur auf Ihre persönliche Einschätzung an. 

          </p>
      `,
      choices: ['Weiter'],
  }

    const evaluation1 = {
      type: jsPsychHtmlSliderResponse,
      stimulus: function () {
        return `
          <p>Wie positiv oder negativ ist das Gefühl, das das Quadrat in dieser Farbe bei Ihnen auslöst?</p>
          <img src="${jsPsych.timelineVariable('image')}" style="width: 200px; height: 200px;">
        `;
      },
      button_label: 'Weiter',
      require_movement: true,
      labels: ['sehr negativ', 'neutral', 'sehr positiv'],
    };
    
    const evaluation_procedure = {
      timeline: [evaluation1],
      timeline_variables: images.map(img => ({ image: img.image })), // Loops through all images
      randomize_order: true, // Optional: Randomize trial order
    };
    
  
///////////////////////////////////////////////////////////////////////////////////////////////////
//Free Sampling EC ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////



    const free_sampling_transition = {
      type: jsPsychHtmlButtonResponse,
      stimulus: `
          <p>
              Im Folgenden erfahren Sie mehr darüber, welche positiven oder negativen Eigenschaften mit den farbigen Quadraten verbunden sind. 
              <br><br>
              Pro Durchgang sehen Sie alle 6 Quadrate in einer Übersicht. Sie wählen durch Anklicken jeweils eines der farbigen Quadrate aus. 
              <br>Das ausgewählte Quadrat wird dann gleichzeitig mit einem <b>positiven</b> oder <b>negativen</b> Eigenschaftswort gezeigt.  
              <br><br>
              Nach jedem Durchgang kehren Sie automatisch zur Übersicht aller 6 Quadrate zurück. 
              <br><b>Klicken Sie dort auf das Bild eines Quadrats</b>, um mehr über seine Eigenschaften zu erfahren. 
              <br>Insgesamt haben Sie die Möglichkeit, in <b>${trials} Durchgängen</b> etwas über die Eigenschaften der Quadrate zu erfahren.
              <br><br>
              <b>Sie können jedes Mal völlig frei entscheiden, bei welchem farbigen Quadrat Sie mehr über dessen Eigenschaften erfahren möchten.</b>
          </p>
      `,
      choices: ['Weiter'],
  }

  const free_sampling_introduction = {
      type: jsPsychHtmlButtonResponse,
      stimulus: `
          <p>
              Jetzt geht es mit der eigentlichen Aufgabe los. Hier eine kurze Erinnerung:
              <br><br>
              Pro Durchgang sehen Sie alle 6 Quadrate in einer Übersicht. 
              <br>Sie wählen durch Anklicken jeweils eines der farbigen Quadrate aus. 
              <br>Das ausgewählte Quadrat wird dann gleichzeitig mit einem <b>positiven</b> oder <b>negativen</b> Eigenschaftswort gezeigt.  
              <br><br>
              Nach jedem Durchgang kehren Sie autoamtsich zur Übersicht aller 6 Quadrate zurück. 
              <br><b>Klicken Sie dort auf das Bild eines Quadrats</b>, um mehr über seine Eigenschaften zu erfahren. 
              <br>Insgesamt haben Sie die Möglichkeit, in <b>${trials} Durchgängen</b> etwas über die Eigenschaften der Quadrate zu erfahren.
              <br><br>
              <b>Sie können jedes Mal völlig frei entscheiden, bei welchem farbigen Quadrat Sie mehr über dessen Eigenschaften erfahren möchten.</b>
          </p>
      `,
      choices: ['Weiter'],
      on_start: function () {
        document.body.style.cursor = 'default';
    },
  }




// Define individual trial components
const trial_1 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function () {
      return `Klicken Sie auf ein Quadrat, um einen Durchgang zu beginnen!<br><br>Verbleibende Durchgänge ${count}`;
  },
  choices: "NO_KEYS",
  trial_duration: 2000,
  on_start: function () {
    document.body.style.cursor = 'default';
},
  extensions: [{ type: jsPsychExtensionWebgazer, params: { targets: ['#jspsych-html-keyboard-response-stimulus'] } }],
};

const trial_2 = { 
  type: jsPsychHtmlKeyboardResponse, 
  stimulus: ``, 
  choices: "NO_KEYS", 
  trial_duration: 500,
  extensions: [{ type: jsPsychExtensionWebgazer, params: { targets: ['#jspsych-html-keyboard-response-stimulus'] } }],
};

const trial_3 = { 
  type: jsPsychHtmlKeyboardResponse, 
  stimulus: `+`, 
  choices: "NO_KEYS", 
  trial_duration: 500,
  extensions: [{ type: jsPsychExtensionWebgazer, params: { targets: ['#jspsych-html-keyboard-response-stimulus'] } }],
};

const trial_4 = { 
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '',
  choices: "NO_KEYS",
  on_start: function (trial) {
      let html = ``;
      for (let i = 0; i < images.length; i++) {
          const style = `position: absolute; left: ${positions[i].left}; top: ${positions[i].top}; transform: translateX(-50%) translateY(-50%); width: 100px; height: 100px; cursor: pointer;`;
          html += `<img src="${images[i].image}" style="${style}" id="img-${i}" data-image="${images[i].image}" onclick="handleImageClick(event, ${i})" />`;
      }
      trial.stimulus = html;
  },
  on_finish: function (data) {
      data.clicked_image = window.clicked_image;
      data.association = window.association;
      data.count = count;
  },
  extensions: [{ type: jsPsychExtensionWebgazer, params: { targets: ['#img-0', '#img-1', '#img-2', '#img-3', '#img-4', '#img-5'] } }],
};

const trial_5 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: ``,
  choices: "NO_KEYS",
  trial_duration: 500,
  extensions: [{ type: jsPsychExtensionWebgazer, params: { targets: ['#jspsych-html-keyboard-response-stimulus'] } }],
};

const trial_6 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: ``,
  on_start: function (trial) {
      const lastData = jsPsych.data.get().last(2).values()[0];
      const style_image = `position: absolute; left: ${left_right[lastData.association]}; top: 50%; transform: translateX(-50%) translateY(-40%); width: 100px; height: 100px;`;
      let html = `<img style="${style_image}" id="square" src="${lastData.clicked_image}" />`;

      word = wordlist[lastData.association].pop();
      const style_word = `position: absolute; left: ${left_right[lastData.association]}; top: 50%; transform: translateX(-50%) translateY(+50px); width: 100px; height: 100px;`;
      html += `<p style="${style_word}">${word}</p>`;
      used_words[lastData.association].push(word);

      count--;
      if (count == 0) count = trials;
      trial.stimulus = html;
  },
  on_finish: function (data) {
      data.word = word;
  },
  choices: "NO_KEYS",
  trial_duration: 2000,
  extensions: [{ type: jsPsychExtensionWebgazer, params: { targets: ['#square'] } }],
};

const trial_7 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: ``,
  choices: "NO_KEYS",
  trial_duration: 500,
  extensions: [{ type: jsPsychExtensionWebgazer, params: { targets: ['#jspsych-html-keyboard-response-stimulus'] } }],
};

// Function to handle image click
function handleImageClick(event, id) {
  window.clicked_image = images[id].image;
  window.association = images[id].association;
  console.log(`Count: ${count}, Clicked image: ${window.clicked_image}, Association: ${window.association}`);
  jsPsych.finishTrial();
}

// Define the free_samplings procedure without nesting
const free_samplings = { timeline: [] };

console.log("Initializing free sampling trials...");


for (let i = 0; i < trials; i++) {
// Add recalibration before specific trials
  console.log(`Adding free sampling trials at iteration ${i}`);
  free_samplings.timeline.push(trial_1, trial_2, trial_3, trial_4, trial_5, trial_6, trial_7);
}












///////////////////////////////////////////////////////////////////////////////////////////////////
//Regular EC ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////



  const regular_ec_transition = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <p>
            Im Folgenden erfahren Sie mehr darüber, welche positiven oder negativen Eigenschaften mit den farbigen Quadraten verbunden sind. 
            <br><br>
            Pro Durchgang sehen Sie alle 6 Quadrate in einer Übersicht. 
            <br>Der Computer wird wiederholt und nach dem Zufallsprinzip entscheiden, zu welchem Quadrat Sie mehr erfahren. 
            <br>Das ausgewählte Quadrat wird dann gleichzeitig mit einem <b>positiven</b> oder <b>negativen</b> Eigenschaftswort gezeigt.
            <br><br> 
            Nach jedem Durchgang kehren Sie automatisch zur Übersicht aller 6 Quadrate zurück. 
            <br>Insgesamt werden <b>${trials} zufällige Durchgänge</b> gezeigt, in denen Sie etwas über die Eigenschaften der Quadrate erfahren.
            <br><b>Bitte beobachten Sie diese Durchgänge aufmerksam.</b>
        </p>
    `,
    choices: ['Weiter'],
}

const regular_ec_introduction = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <p>
            Jetzt geht es mit der eigentlichen Aufgabe los. Hier eine kurze Erinnerung: 
            <br><br>
            Pro Durchgang sehen Sie alle 6 Quadrate in einer Übersicht. 
            <br>Der Computer wird wiederholt und nach dem Zufallsprinzip entscheiden, zu welchem Quadrat Sie mehr erfahren. 
            <br>Das ausgewählte Quadrat wird dann gleichzeitig mit einem <b>positiven</b> oder <b>negativen</b> Eigenschaftswort gezeigt.
            <br><br> 
            Nach jedem Durchgang kehren Sie automatisch zur Übersicht aller 6 Quadrate zurück. 
            <br>Insgesamt werden <b>${trials} zufällige Durchgänge</b> gezeigt, in denen Sie etwas über die Eigenschaften der Quadrate erfahren.
            <br><b>Bitte beobachten Sie diese Durchgänge aufmerksam.</b>
        </p>
    `,
    choices: ['Weiter'],
    on_start: function () {
        document.body.style.cursor = 'default';
    },
}

    

const regular_ec_trials = [
  {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: function () {
          console.log(`Displaying start message. Remaining trials: ${count}`);
          return `
              Der Computer entscheidet nach dem Zufallsprinzip über den nächsten Durchgang!
              <br><br>
              Verbleibende Durchgänge ${count}
          `;
      },
      choices: "NO_KEYS",
      trial_duration: 2000,
      extensions: [
          {
              type: jsPsychExtensionWebgazer, 
              params: {targets: ['#jspsych-html-keyboard-response-stimulus']}
          }
      ],
  },
  {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: ``,
      choices: "NO_KEYS",
      trial_duration: 500,
      extensions: [
          {
              type: jsPsychExtensionWebgazer, 
              params: {targets: ['#jspsych-html-keyboard-response-stimulus']}
          }
      ],
  },
  {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `+`,
      choices: "NO_KEYS",
      trial_duration: 500,
      extensions: [
          {
              type: jsPsychExtensionWebgazer, 
              params: {targets: ['#jspsych-html-keyboard-response-stimulus']}
          }
      ],
  },
  {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '',
      choices: "NO_KEYS",
      trial_duration: 2000,
      on_start: function (trial) {
          let html = ``;
          for (let i = 0; i < images.length; i++) {
              const style = `position: absolute; left: ${positions[i].left}; top: ${positions[i].top}; transform: translateX(-50%) translateY(-50%); width: 100px; height: 100px;`;
              html += `<img src="${images[i].image}" style="${style}" id="img-${i}" data-image="${images[i].image}"/>`;
          }
          console.log("Displaying images:", images);
          trial.stimulus = html;
      },
      on_finish: function (data) {
          let rand_id = Math.floor(Math.random() * images.length);
          data.clicked_image = images[rand_id].image;
          data.association = images[rand_id].association;
          data.count = count;
          console.log(`Randomly selected image: ${data.clicked_image}, Association: ${data.association}`);
      },
      extensions: [
          {
              type: jsPsychExtensionWebgazer, 
              params: {targets: ['#img-0','#img-1','#img-2','#img-3','#img-4','#img-5']}
          }
      ],
  },
  {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: ``,
      choices: "NO_KEYS",
      trial_duration: 500,
      extensions: [
          {
              type: jsPsychExtensionWebgazer, 
              params: {targets: ['#jspsych-html-keyboard-response-stimulus']}
          }
      ],
  },
  {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: ``,
      on_start: function (trial) {
          let lastData = jsPsych.data.get().last(2).values()[0];
          const style_image = `position: absolute; left: ${left_right[lastData.association]}; top: 50%; transform: translateX(-50%) translateY(-40%); width: 100px; height: 100px;`;
          let html = `<img style="${style_image}" id="square" src="${lastData.clicked_image}" />`;

          word = wordlist[lastData.association].pop();
          const style_word = `position: absolute; left: ${left_right[lastData.association]}; top: 50%; transform: translateX(-50%) translateY(+50px); width: 100px; height: 100px;`;
          html += `<p style="${style_word}">${word}</p>`
          used_words[lastData.association].push(word);

          console.log("Used words:", used_words);
          console.log(`Selected word: ${word}`);

          count--;
          if (count == 0) count = trials;

          trial.stimulus = html;
      },
      on_finish: function (data) {
          data.word = word;
      },
      choices: "NO_KEYS",
      trial_duration: 2000,
      extensions: [
          {
              type: jsPsychExtensionWebgazer, 
              params: {targets: ['#square']}
          }
      ],
  },
  {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: ``,
      choices: "NO_KEYS",
      trial_duration: 500,
      extensions: [
          {
              type: jsPsychExtensionWebgazer, 
              params: {targets: ['#jspsych-html-keyboard-response-stimulus']}
          }
      ],
  }
];

const regular_ec_trials_list = { timeline: [] };

for (let i = 0; i < trials; i++) {
    console.log(`Adding regular EC trials at iteration ${i}`);
    for (let trial of regular_ec_trials) {
        regular_ec_trials_list.timeline.push(trial);
    }
}




///////////////////////////////////////////////////////////////////////////////////////////////////
// Evaluation 2 ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////


const evaluation2_intro = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
      <p>
          Bitte beurteilen Sie die farbigen Quadrate noch einmal. 
          <br><br>
          Sie werden nun alle 6 Quadrate einzeln sehen. 
          <br>Geben Sie bitte an, wie <b>positiv oder negativ</b> Ihre emotionalen Reaktionen auf das jeweilige Quadrat ist. 
          <br>Dabei gibt es wie zuvor keine richtigen oder falschen Antworten. 
          <br>Es kommt uns nur auf Ihre persönliche Einschätzung an. 
          <br><br>
          Dieses Mal geben Sie bitte außerdem an, wie <b>sicher</b> Sie sich bei Ihren einzelnen Einschätzungen sind. 
          <br>Orientieren Sie sich dabei daran, wie lange Sie bei der Entscheidung nachdenken mussten bzw. wie viel Zeit Sie dafür gebraucht haben.
      </p>
  `,
  choices: ['Weiter'],
}



const evaluation2 = {
  type: jsPsychHtmlSliderResponse,
  stimulus: function () {
    return `
      <p>Wie positiv oder negativ ist das Gefühl, das das Quadrat in dieser Farbe bei Ihnen auslöst?</p>
      <img src="${jsPsych.timelineVariable('image')}" style="width: 200px; height: 200px;">
    `;
  },
  button_label: 'Weiter',
  require_movement: true,
  labels: ['sehr negativ', 'neutral', 'sehr positiv'],
};


const evaluation_cert2 = {
  type: jsPsychSurveyLikert,
  preamble: function () {
    return `
      <p>Wie sicher sind Sie sich bei Ihrer Einschätzung dieses Quadrats?</p>
      <img src="${jsPsych.timelineVariable('image')}" style="width: 200px; height: 200px;">
    `;
  },
  questions: [
    {
      prompt: "",
      labels: [
        "0<br>gar nicht sicher",
        "1", "2", "3", "4", "5", "6", "7", "8", "9",
        "10<br>extrem sicher"
      ],
      required: true,
    }
  ],
  button_label: "Weiter",
};

  const evaluation2_procedure = {
    timeline: [evaluation2, evaluation_cert2], // Runs evaluation first, then certainty
    timeline_variables: images.map(img => ({ image: img.image })), // Loops through all images
    randomize_order: true, // Optional: Randomizes order of image pairs
  };


///////////////////////////////////////////////////////////////////////////////////////////////////
// Frequency Estimates ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

  const estimate = {
    type: jsPsychHtmlKeyboardResponse,
    choices: "NO_KEYS",
    stimulus: `
        <p>
            Während der Durchgänge sind die Quadrate gleichzeitig mit positiven oder negativen Eigenschaftsworte gezeigt worden. <br><br>Ihrer Schätzung nach, wie viele der ${trials} Eigenschaftsworte waren positiv bzw. negativ?
            <br><br>
            Anzahl der positiven Eigenschaftsworte: <input id="estimate_positive" name="estimate_positive" type="number" min="0" max="${trials}" style="width:100px;" oninput="checkEstimates()" required /><br>
            Anzahl der negativen Eigenschaftsworte: <input id="estimate_negative" name="estimate_negative" type="number" min="0" max="${trials}" style="width:100px;" oninput="checkEstimates()" required />
            <br><br>
            ACHTUNG! Die Summer beider Zahlen muss ${trials} ergeben!
        </p>
        <button id="next" class="jspsych-btn" onclick="jsPsych.finishTrial()" disabled>Weiter</button>
    `,
};

const estimate_individuals = {
    type: jsPsychHtmlKeyboardResponse,
    choices: "NO_KEYS",
    stimulus: function () {
        let html = 'Schätzen Sie: Wie oft haben Sie die jeweiligen Quadrate gesehen?<br><br>';
        for (let i=0; i<images.length; i++) {
            html += `
                <img src="${images[i].image}" style="width:50px; transform: translateY(+25%); margin-right: 50px;" />
                <input name="estimate_${i}" type="number" min="0" max="${trials}" style="width:100px;" oninput="checkEstimates()" required /> Durchgänge (0 bis ${trials})<br>
            `
        }
        html += `
            <p>ACHTUNG! Die Summer aller Zahlen muss ${trials} ergeben!</p>
            <button id="next" class="jspsych-btn" onclick="jsPsych.finishTrial()" disabled>Weiter</button>
        `
        return html;
    },
    on_finish: function(data) {
        data.estimate_individuals = window.estimate_individuals;
    }
};

// Function to handle button click
function checkEstimates() {
    estimates = document.querySelectorAll("input[type=number]");
    
    var est = 0;

    let estimate_individuals = "";

    for (let i=0; i<estimates.length; i++) {
        est += parseInt(estimates[i].value);
        if (parseInt(estimates[i].value) > 0)
            estimate_individuals += 1;
        else
            estimate_individuals += 0;
    }

    window.estimate_individuals = estimate_individuals;

    console.log(estimate_individuals);

    if(est==trials) {
        document.getElementById("next").disabled = false;
    } else {
        document.getElementById("next").disabled = true;
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Joint Occurrence ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////


const joint_occurence_intro = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <p>
            Nachfolgend sehen Sie alle Quadrate, auch diejenigen, die Sie in keinem Durchgang gesehen haben. 
            <br><br>
            Geben Sie für jedes Quadrat an, ob es Ihrer Meinung nach öfter zusammen mit positiven oder negativen Eigenschaftsworten auftreten.
            <br> Für Quadrate, die Sie nicht gesehen haben, wählen Sie nach Ihrer Vermutung aus.
        </p>
    `,
    choices: ['Weiter'],
};

const joint_occurence_setup = {
  type: jsPsychSurveyLikert,
  preamble: function () {
    return `
      <p>Tritt dieses Quadrat öfter gemeinsam mit positiven oder mit negativen Eigenschaftsworten auf?</p>
      <img src="${jsPsych.timelineVariable('image')}" style="width: 200px; height: 200px;">
    `;
  },
  questions: [
    {
      prompt: "",
      labels: [
        "Mit <b>positiven</b> Eigenschaftsworten",
        "Mit <b>negativen</b> Eigenschaftsworten"
      ],
      required: true,
    }
  ]
};

  const joint_occurence_procedure = {
    timeline: [joint_occurence_setup], 
    timeline_variables: images.map(img => ({ image: img.image })), // Loops through all images
    randomize_order: true, // Optional: Randomizes order of image pairs
  };

///////////////////////////////////////////////////////////////////////////////////////////////////
// Word Ratings  ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////


  const word_rating_intro = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <p>
            Nun bewerten Sie die Eigenschaftsworte, die den Quadraten zugeordnet wurden. 
            <br><br>
            Geben Sie bitte an, wie <b>positiv oder negativ</b> Sie Ihre emotionale Reaktionen auf das entsprechende Eigenschaftswort sind. 
            <br><br>
            Dabei gibt es wie zuvor keine richtigen oder falschen Antworten. Es kommt uns nur auf Ihre persönliche Einschätzung an. 
            <br><br>
            Geben Sie bitte außerdem an, wie <b>sicher</b> Sie sich bei Ihren einzelnen Einschätzungen sind. 
            <br>Orientieren Sie sich dabei daran, wie lange Sie bei der Entscheidung nachdenken mussten bzw. wie viel Zeit Sie dafür gebraucht haben.

        </p>
    `,
    choices: ['Weiter'],
};

// Define the Word Ratings procedure
const word_ratings = {
  timeline: []
};

// Function to pick a word dynamically based on the current word list and association
const getWord = () => {
  // Merge both word lists into one combined list
  const combinedList = [...wordlist[0], ...wordlist[1]];
  
  // Shuffle the combined list to randomize the order
  const shuffledList = jsPsych.randomization.shuffle(combinedList);

  // Pop and return the next word from the shuffled list
  let word = shuffledList.pop();

  return word;
};

// Define the trials for the word ratings
for (let i = 0; i < trials; i++) {
  // Create the Word Rating Slider
  const word_rating_slider = {
      type: jsPsychHtmlSliderResponse,
      stimulus: function () {
          const word = getWord();  // Get the current word dynamically
          let html = `
              <p>
                  Wie positiv oder negativ ist Ihr Eindruck dieses Eigenschaftsworts?<br><br>
                  ${word}
              </p>
          `;
          return html;
      },
      require_movement: true,
      labels: ['sehr negativ', 'neutral', 'sehr positiv'],
      button_label: "Weiter",
      on_start: function() {
          // Assign word dynamically based on the state of the word lists
          // Store the word in jsPsych data so it can be accessed in the next trial
          word = getWord();
          jsPsych.data.addDataToLastTrial({ word: word });
      }
  };

  // Create the Word Rating Likert
  const word_rating_likert = {
      type: jsPsychSurveyLikert,
      preamble: function () {
          const word = jsPsych.data.get().last(1).values()[0].word;  // Retrieve the word from the previous trial
          let html = `
              <p>
                  Wie sicher waren Sie sich bei Ihrer Einschätzung des Eigenschaftsworts?<br><br>
                  
              </p>
          `;
          return html;
      },
      questions: [
          {
              prompt: "",
              labels: [
                  "0<br>gar nicht sicher",
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "10<br>extrem sicher",
              ],
              required: true,
          }
      ], 
      button_label: "Weiter",
      on_start: function() {
          // No need to reassign the word here, we get it from the previous trial
          const word = jsPsych.data.get().last(1).values()[0].word;
          // Store the word again in the data to ensure it’s available if needed later
          jsPsych.data.addDataToLastTrial({ word: word });
      }
  };

  // Push the slider and Likert trials into the timeline
  word_ratings.timeline.push(word_rating_slider);
  word_ratings.timeline.push(word_rating_likert);
}


///////////////////////////////////////////////////////////////////////////////////////////////////
// Regular EC + Extinction ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

const regular_ec_extinction_introduction = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
      <p>
          Bei der nächsten Aufgabe haben Sie die Möglichkeit, <b>noch einmal nacheinander mehr über diese Quadrate zu erfahren.</b>
          <br><br>
          Pro Durchgang sehen Sie alle 6 Quadrate in einer Übersicht. Der Computer wird wiederholt und nach dem Zufallsprinzip entscheiden, zu welchem Quadrat Sie mehr erfahren. Das ausgewählte Quadrat wird dann gleichzeitig mit einem <b>positiven</b> oder <b>negativen</b> Eigenschaftswort gezeigt.
          <br><br> 
          Nach jedem Durchgang kehren Sie zur Übersicht aller 6 Quadrate zurück. Insgesamt werden <b>${trials} zufällige Durchgänge</b> gezeigt, in denen Sie etwas über die Eigenschaften der Quadrate erfahren.
          <b>Bitte beobachten Sie diese Durchgänge aufmerksam.</b>
      </p>
  `,
  choices: ['Weiter'],
}




const regular_ec_trials2 = [
  {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: function () {
          console.log(`Displaying start message. Remaining trials: ${count}`);
          return `
              Der Computer entscheidet nach dem Zufallsprinzip über den nächsten Durchgang!
              <br><br>
              Verbleibende Durchgänge ${count}
          `;
      },
      choices: "NO_KEYS",
      trial_duration: 2000,
      extensions: [
          {
              type: jsPsychExtensionWebgazer, 
              params: {targets: ['#jspsych-html-keyboard-response-stimulus']}
          }
      ],
  },
  {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: ``,
      choices: "NO_KEYS",
      trial_duration: 500,
      extensions: [
          {
              type: jsPsychExtensionWebgazer, 
              params: {targets: ['#jspsych-html-keyboard-response-stimulus']}
          }
      ],
  },
  {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `+`,
      choices: "NO_KEYS",
      trial_duration: 500,
      extensions: [
          {
              type: jsPsychExtensionWebgazer, 
              params: {targets: ['#jspsych-html-keyboard-response-stimulus']}
          }
      ],
  },
  {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '',
      choices: "NO_KEYS",
      trial_duration: 2000,
      on_start: function (trial) {
          let html = ``;
          for (let i = 0; i < images.length; i++) {
              const style = `position: absolute; left: ${positions[i].left}; top: ${positions[i].top}; transform: translateX(-50%) translateY(-50%); width: 100px; height: 100px;`;
              html += `<img src="${images[i].image}" style="${style}" id="img-${i}" data-image="${images[i].image}"/>`;
          }
          console.log("Displaying images:", images);
          trial.stimulus = html;
      },
      on_finish: function (data) {
          let rand_id = Math.floor(Math.random() * images.length);
          data.clicked_image = images[rand_id].image;
          data.association = images[rand_id].association;
          data.count = count;
          console.log(`Randomly selected image: ${data.clicked_image}, Association: ${data.association}`);
      },
      extensions: [
          {
              type: jsPsychExtensionWebgazer, 
              params: {targets: ['#img-0','#img-1','#img-2','#img-3','#img-4','#img-5']}
          }
      ],
  },
  {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: ``,
      choices: "NO_KEYS",
      trial_duration: 500,
      extensions: [
          {
              type: jsPsychExtensionWebgazer, 
              params: {targets: ['#jspsych-html-keyboard-response-stimulus']}
          }
      ],
  },
  {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: ``,
      on_start: function (trial) {
          let lastData = jsPsych.data.get().last(2).values()[0];
          const style_image = `position: absolute; left: ${left_right[lastData.association]}; top: 50%; transform: translateX(-50%) translateY(-40%); width: 100px; height: 100px;`;
          let html = `<img style="${style_image}" id="square" src="${lastData.clicked_image}" />`;

          word = wordlist[lastData.association].pop();
          const style_word = `position: absolute; left: ${left_right[lastData.association]}; top: 50%; transform: translateX(-50%) translateY(+50px); width: 100px; height: 100px;`;
          html += `<p style="${style_word}">${word}</p>`
          used_words[lastData.association].push(word);

          console.log("Used words:", used_words);
          console.log(`Selected word: ${word}`);

          count--;
          if (count == 0) count = trials;

          trial.stimulus = html;
      },
      on_finish: function (data) {
          data.word = word;
      },
      choices: "NO_KEYS",
      trial_duration: 2000,
      extensions: [
          {
              type: jsPsychExtensionWebgazer, 
              params: {targets: ['#square']}
          }
      ],
  },
  {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: ``,
      choices: "NO_KEYS",
      trial_duration: 500,
      extensions: [
          {
              type: jsPsychExtensionWebgazer, 
              params: {targets: ['#jspsych-html-keyboard-response-stimulus']}
          }
      ],
  }
];

const regular_ec_trials2_list = { timeline: [] };

for (let i = 0; i < trials/2; i++) {
    console.log(`Adding regular EC trials at iteration ${i}`);
    for (let trial of regular_ec_trials2) {
      regular_ec_trials2_list.timeline.push(trial);
    }
}


const extinction_ec = {
  timeline: [
      {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: function () {
              const html = `
                  Der Computer entscheidet nach dem Zufallsprinzip über den nächsten Durchgang!
                  <br><br>
                  Verbleibende Durchgänge ${count}
              `
              return html;
          },
          choices: "NO_KEYS",
          trial_duration: 2000,
          extensions: [
              {
                  type: jsPsychExtensionWebgazer, 
                  params: {targets: ['#jspsych-html-keyboard-response-stimulus']}
              }
          ],
      },
      {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: ``,
          choices: "NO_KEYS",
          trial_duration: 500,
          extensions: [
              {
                  type: jsPsychExtensionWebgazer, 
                  params: {targets: ['#jspsych-html-keyboard-response-stimulus']}
              }
          ],
      },
      {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: `+`,
          choices: "NO_KEYS",
          trial_duration: 500,
          extensions: [
              {
                  type: jsPsychExtensionWebgazer, 
                  params: {targets: ['#jspsych-html-keyboard-response-stimulus']}
              }
          ],
      },
      {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: '',
          choices: "NO_KEYS",
          trial_duration: 2000,
          on_start: function (trial) {
              let html = ``;
              for (let i = 0; i < images.length; i++) {
                  const style = `position: absolute; left: ${positions[i].left}; top: ${positions[i].top}; transform: translateX(-50%) translateY(-50%); width: 100px; height: 100px;`;
                  html += `<img src="${images[i].image}" style="${style}" id="img-${i}" data-image="${images[i].image}"/>`;
              }
              trial.stimulus = html;
          },
          on_finish: function (data) {
              rand_id = Math.floor(Math.random() * 6);
              data.clicked_image = images[rand_id].image;
              data.association = images[rand_id].association;
              data.count = count;
          },
          extensions: [
              {
                  type: jsPsychExtensionWebgazer, 
                  params: {targets: ['#img-0','#img-1','#img-2','#img-3','#img-4','#img-5']}
              }
          ],
      },
      {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: ``,
          choices: "NO_KEYS",
          trial_duration: 500,
          extensions: [
              {
                  type: jsPsychExtensionWebgazer, 
                  params: {targets: ['#jspsych-html-keyboard-response-stimulus']}
              }
          ],
      },
      {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: ``,
          on_start: function (trial) {
              const style_image = `position: absolute; left: ${left_right[jsPsych.data.get().last(2).values()[0].association]}; top: 50%; transform: translateX(-50%) translateY(-40%); width: 100px; height: 100px;`;
              let html = `<img style="${style_image}" id="square" src="${jsPsych.data.get().last(2).values()[0].clicked_image}" />`;
              
              count --;
              if (count == 0)
                  count = trials;
              trial.stimulus = html;
          },
          choices: "NO_KEYS",
          trial_duration: 2000,
          extensions: [
              {
                  type: jsPsychExtensionWebgazer, 
                  params: {targets: ['#square']}
              }
          ],
      },
      {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: ``,
          choices: "NO_KEYS",
          trial_duration: 500,
          extensions: [
              {
                  type: jsPsychExtensionWebgazer, 
                  params: {targets: ['#jspsych-html-keyboard-response-stimulus']}
              }
          ],
      },
  ]
}

const extinction_list = { timeline: [] };

for (let i = 0; i < trials/2; i++) {
    console.log(`Adding extinction trials at iteration ${i}`);
    for (let trial of extinction_ec) {
      extinction_list.timeline.push(trial);
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////
// Evaluation 3 ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////


const evaluation3_intro = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
      <p>
          Bitte beurteilen Sie die farbigen Quadrate noch einmal. 
          <br><br>
          Sie werden nun alle 6 Quadrate einzeln sehen. 
          <br>Geben Sie bitte an, wie <b>positiv oder negativ</b> Ihre emotionalen Reaktionen auf das jeweilige Quadrat ist. 
          <br>Dabei gibt es wie zuvor keine richtigen oder falschen Antworten. 
          <br>Es kommt uns nur auf Ihre persönliche Einschätzung an. 
          <br><br>
          Dieses Mal geben Sie bitte außerdem an, wie <b>sicher</b> Sie sich bei Ihren einzelnen Einschätzungen sind. 
          <br>Orientieren Sie sich dabei daran, wie lange Sie bei der Entscheidung nachdenken mussten bzw. wie viel Zeit Sie dafür gebraucht haben.
      </p>
  `,
  choices: ['Weiter'],
}



const evaluation3 = {
  type: jsPsychHtmlSliderResponse,
  stimulus: function () {
    return `
      <p>Wie positiv oder negativ ist das Gefühl, das das Quadrat in dieser Farbe bei Ihnen auslöst?</p>
      <img src="${jsPsych.timelineVariable('image')}" style="width: 200px; height: 200px;">
    `;
  },
  button_label: 'Weiter',
  require_movement: true,
  labels: ['sehr negativ', 'neutral', 'sehr positiv'],
};


const evaluation_cert3 = {
  type: jsPsychSurveyLikert,
  preamble: function () {
    return `
      <p>Wie sicher sind Sie sich bei Ihrer Einschätzung dieses Quadrats?</p>
      <img src="${jsPsych.timelineVariable('image')}" style="width: 200px; height: 200px;">
    `;
  },
  questions: [
    {
      prompt: "",
      labels: [
        "0<br>gar nicht sicher",
        "1", "2", "3", "4", "5", "6", "7", "8", "9",
        "10<br>extrem sicher"
      ],
      required: true,
    }
  ],
  button_label: "Weiter",
};

  const evaluation3_procedure = {
    timeline: [evaluation2, evaluation_cert2], // Runs evaluation first, then certainty
    timeline_variables: images.map(img => ({ image: img.image })), // Loops through all images
    randomize_order: true, // Optional: Randomizes order of image pairs
  };


///////////////////////////////////////////////////////////////////////////////////////////////////
// Frequency Estimates 2 ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

const estimate2 = {
  type: jsPsychHtmlKeyboardResponse,
  choices: "NO_KEYS",
  stimulus: `
      <p>
          Während der Durchgänge sind die Quadrate gleichzeitig mit positiven oder negativen Eigenschaftsworte gezeigt worden. <br><br>Ihrer Schätzung nach, wie viele der letzten ${trials} Eigenschaftsworte waren positiv bzw. negativ?
          <br><br>
          Anzahl der positiven Eigenschaftsworte: <input id="estimate_positive" name="estimate_positive" type="number" min="0" max="${trials}" style="width:100px;" oninput="checkEstimates()" required /><br>
          Anzahl der negativen Eigenschaftsworte: <input id="estimate_negative" name="estimate_negative" type="number" min="0" max="${trials}" style="width:100px;" oninput="checkEstimates()" required />
          <br><br>
          ACHTUNG! Die Summer beider Zahlen muss ${trials} ergeben!
      </p>
      <button id="next" class="jspsych-btn" onclick="jsPsych.finishTrial()" disabled>Weiter</button>
  `,
};

const estimate2_individuals = {
  type: jsPsychHtmlKeyboardResponse,
  choices: "NO_KEYS",
  stimulus: function () {
      let html = 'Schätzen Sie: Wie oft haben Sie die jeweiligen Quadrate gesehen?<br><br>';
      for (let i=0; i<images.length; i++) {
          html += `
              <img src="${images[i].image}" style="width:50px; transform: translateY(+25%); margin-right: 50px;" />
              <input name="estimate2_${i}" type="number" min="0" max="${trials}" style="width:100px;" oninput="checkEstimates2()" required /> Durchgänge (0 bis ${trials})<br>
          `
      }
      html += `
          <p>ACHTUNG! Die Summer aller Zahlen muss ${trials} ergeben!</p>
          <button id="next" class="jspsych-btn" onclick="jsPsych.finishTrial()" disabled>Weiter</button>
      `
      return html;
  },
  on_finish: function(data) {
      data.estimate2_individuals = window.estimate2_individuals;
  }
};

// Function to handle button click
function checkEstimates2() {
  estimates2 = document.querySelectorAll("input[type=number]");
  
  var est2 = 0;

  let estimate2_individuals = "";

  for (let i=0; i<estimates2.length; i++) {
      est2 += parseInt(estimates2[i].value);
      if (parseInt(estimates2[i].value) > 0)
          estimate2_individuals += 1;
      else
          estimate2_individuals += 0;
  }

  window.estimate2_individuals = estimate2_individuals;

  console.log(estimate2_individuals);

  if(est2==trials) {
      document.getElementById("next").disabled = false;
  } else {
      document.getElementById("next").disabled = true;
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////
// Joint Occurrence 2 ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////


const joint_occurence2_intro = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
      <p>
          Nachfolgend sehen Sie alle Quadrate, auch diejenigen, die Sie in keinem Durchgang gesehen haben. 
          <br><br>
          Geben Sie für jedes Quadrat an, ob es Ihrer Meinung nach öfter zusammen mit positiven oder negativen Eigenschaftsworten auftreten.
          <br> Für Quadrate, die Sie nicht gesehen haben, wählen Sie nach Ihrer Vermutung aus.
      </p>
  `,
  choices: ['Weiter'],
};

const joint_occurence2_setup = {
type: jsPsychSurveyLikert,
preamble: function () {
  return `
    <p>Tritt dieses Quadrat öfter gemeinsam mit positiven oder mit negativen Eigenschaftsworten auf?</p>
    <img src="${jsPsych.timelineVariable('image')}" style="width: 200px; height: 200px;">
  `;
},
questions: [
  {
    prompt: "",
    labels: [
      "Mit <b>positiven</b> Eigenschaftsworten",
      "Mit <b>negativen</b> Eigenschaftsworten"
    ],
    required: true,
  }
]
};

const joint_occurence2_procedure = {
  timeline: [joint_occurence2_setup], 
  timeline_variables: images.map(img => ({ image: img.image })), // Loops through all images
  randomize_order: true, // Optional: Randomizes order of image pairs
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Word Ratings 2 ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////


const word_rating2_intro = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
      <p>
          Nun bewerten Sie die Eigenschaftsworte, die den Quadraten zugeordnet wurden. 
          <br><br>
          Geben Sie bitte an, wie <b>positiv oder negativ</b> Sie Ihre emotionale Reaktionen auf das entsprechende Eigenschaftswort sind. 
          <br><br>
          Dabei gibt es wie zuvor keine richtigen oder falschen Antworten. Es kommt uns nur auf Ihre persönliche Einschätzung an. 
          <br><br>
          Geben Sie bitte außerdem an, wie <b>sicher</b> Sie sich bei Ihren einzelnen Einschätzungen sind. 
          <br>Orientieren Sie sich dabei daran, wie lange Sie bei der Entscheidung nachdenken mussten bzw. wie viel Zeit Sie dafür gebraucht haben.

      </p>
  `,
  choices: ['Weiter'],
};

// Define the Word Ratings procedure
const word_ratings2 = {
timeline: []
};



// Define the trials for the word ratings
for (let i = 0; i < trials; i++) {
// Create the Word Rating Slider
const word_rating2_slider = {
    type: jsPsychHtmlSliderResponse,
    stimulus: function () {
        const word = getWord();  // Get the current word dynamically
        let html = `
            <p>
                Wie positiv oder negativ ist Ihr Eindruck dieses Eigenschaftsworts?<br><br>
                ${word}
            </p>
        `;
        return html;
    },
    require_movement: true,
    labels: ['sehr negativ', 'neutral', 'sehr positiv'],
    button_label: "Weiter",
    on_start: function() {
        // Assign word dynamically based on the state of the word lists
        // Store the word in jsPsych data so it can be accessed in the next trial
        word = getWord();
        jsPsych.data.addDataToLastTrial({ word: word });
    }
};

// Create the Word Rating Likert
const word_rating2_likert = {
    type: jsPsychSurveyLikert,
    preamble: function () {
        const word = jsPsych.data.get().last(1).values()[0].word;  // Retrieve the word from the previous trial
        let html = `
            <p>
                Wie sicher waren Sie sich bei Ihrer Einschätzung des Eigenschaftsworts?<br><br>
                
            </p>
        `;
        return html;
    },
    questions: [
        {
            prompt: "",
            labels: [
                "0<br>gar nicht sicher",
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "10<br>extrem sicher",
            ],
            required: true,
        }
    ],
    button_label: "Weiter",
    on_start: function() {
        // No need to reassign the word here, we get it from the previous trial
        const word = jsPsych.data.get().last(1).values()[0].word;
        // Store the word again in the data to ensure it’s available if needed later
        jsPsych.data.addDataToLastTrial({ word: word });
    }
};

// Push the slider and Likert trials into the timeline
word_ratings2.timeline.push(word_rating2_slider);
word_ratings2.timeline.push(word_rating2_likert);
}

const demographics = {
  type: jsPsychSurveyHtmlForm,
  preamble: '<p>Abschließend bitten wir Sie noch um einige Angaben zu Ihrer Person:</b></p>',
  html: `
      <p> 
          Alter in Jahren: <input name="age" type="number" required /><br>
          Geschlecht: <input name="gender" type="text" required />
      </p>
  `,
  button_label: ['Weiter'],
}


var visioncheck_trial = {
  type: jsPsychHtmlButtonResponse,
  stimulus: '<p>Haben Sie während der Bearbeitung der Studie eine Brille getragen?  </br> </br> Es ist sehr wichtig, dass Sie ehrlich antworten. Es gibt keine negativen Konsequenzen für Sie, wenn Sie eine Brille getragen haben. Wir müssen es nur für die Datenanalyse wissen. </br> </br> Klicken Sie auf Ihre Antwort!</p>',
  choices: ['JA', 'NEIN'],
  required: true,
  data: {
    trial_name: 'visioncheck' 
  }
};

var seriouscheck_trial = {
  type: jsPsychHtmlButtonResponse,
  stimulus: '<p>Haben Sie die Studie ernsthaft bearbeitet? </br> </br> Auch hier ist uns eine ehrliche Antwort sehr wichtig, damit wir wissen, ob wie die von Ihnen generierten Antworten bei der Auswertung einschließen können.</p>',
  choices: ['JA', 'NEIN'],
  required: true,
  data: {
    trial_name: 'seriouscheck' 
  }
};

var feedback = {
  type: jsPsychSurveyText,
  name: 'feedback',
  questions: [
    {prompt: "Haben Sie Feedback zur Studie für uns?", rows: 5, columns:100 , required:false} 
    ],
  preamble: `<div style="max-width: 1000px;"> Sie haben das Ende der Studie erreicht.
  An dieser Stelle wollen wir Fragen, ob Sie uns Feedback zu dieser Studie geben möchten.
  Wenn ja, geben Sie es bitte in das Feld unten ein. Wenn Sie kein Feedback haben, lassen Sie das Feld leer und klicken Sie auf <b>Weiter</b>.
   </div>`,
   button_label: 'Weiter',  
  on_load: function () {
    document.body.style.cursor = 'auto'
  }
};

const randomCode1 = Math.random().toString(36).substring(2, 3).toUpperCase(); 
const randomCode2 = Math.random().toString(36).substring(2, 3).toUpperCase(); 



















    var success_guard = {
        type: jsPsychCallFunction,
        func: () => {successExp = true}
    };

    var on_finish_callback = function () {
        // jsPsych.data.displayData();
        jsPsych.data.addProperties({
            browser_name: bowser.name,
            browser_type: bowser.version,
            subject: subject_id, 
            interaction: jsPsych.data.getInteractionData().json(),
            windowWidth: screen.width,
            windowHeight: screen.height, 
            treatment: treatment,
            images: images,
            positions: positions, 
            left_right: left_right,
        });
        var data = JSON.stringify(jsPsych.data.get().values());
        $.ajax({
             type: "POST",
             url: "/data",
             data: data,
             contentType: "application/json"
           })
           .done(function () {
            ("Das Experiment wurde erfolgreich gespeichert!" +
            "Ihr Teilnahmecode ist: <b> 92830102." +
            "Für VPN Stunden Code senden an: pernilla.bandick@stud.uni-heidelberg.de. " +
            "Sie können das Fenster danach schließen.")
           })
           .fail(function () {
             ("A problem occured while saving the data." +
             "Please save the data to your computer and send it to the experimenter via email: rahal@coll.mpg.de.") ;
             var failsavecsv = jsPsych.data.get().cvs();
             var failsavefilename = jsPsych.data.get().values()[0].subject_id+".csv";
             downloadCSV(csv,failsavefilename);
        })
    }

    function startExp(){
        var timeline = [];
        timeline.push(preload);
        timeline.push(glasses_screening);
        timeline.push(fullscreenEnter);
        timeline.push(ERQ_pageone);
        timeline.push(ERQ_pagetwo);
        timeline.push(ERQ_pagethree);
        timeline.push(evaluation1_intro);
        timeline.push(evaluation_procedure);


      if(treatment == "free_sampling") {
        timeline.push(free_sampling_transition);
        timeline.push(eyeTrackingInstruction1, eyeTrackingNote,init_camera,calibration,validationInstruction, validation,recalibrate);
        timeline.push(free_sampling_introduction);
        console.log("Free sampling trials before pushing:", free_samplings.timeline);
        if (free_samplings.timeline.length > 0) {
            console.log("Adding free_samplings trials to main timeline");
            for (let i = 0; i < free_samplings.timeline.length; i++) {
                timeline.push(free_samplings.timeline[i]);
            }
        } else {
            console.error("free_samplings.timeline is empty. Check trial setup.");
        };
     } else {
          timeline.push(regular_ec_transition);
          timeline.push(eyeTrackingInstruction1, eyeTrackingNote,init_camera,calibration,validationInstruction, validation,recalibrate);
          timeline.push(regular_ec_introduction);
          console.log("Regular EC trials before pushing:", regular_ec_trials_list.timeline);
          if (regular_ec_trials_list.timeline.length > 0) {
              console.log("Adding regular_ec trials to main timeline");
              for (let trial of regular_ec_trials_list.timeline) {
                  timeline.push(trial);
              }
          } else {
              console.error("regular_ec_trials_list.timeline is empty. Check trial setup.");
          }
      }


     // Recalibration before specific trials
        timeline.push({
            timeline: [cali_vali_instructions, fixation_cali, fixation1],
            conditional_function: function () {
                // Check if the trial number is 12, 24, 36, 48 (or any other specific trials you want)
                return [12, 24, 36, 48].includes(jsPsych.data.get().trial_index);
            }
        });
  




        timeline.push(evaluation2_intro);
        timeline.push(evaluation2_procedure);
        timeline.push(estimate);
        timeline.push(estimate_individuals);
        timeline.push(joint_occurence_intro);
        timeline.push(joint_occurence_procedure);
        timeline.push(word_rating_intro);
        timeline.push(word_ratings);


        timeline.push(eyeTrackingInstruction1, eyeTrackingNote,init_camera,calibration,validationInstruction, validation,recalibrate);
        time_line.push(regular_ec_extinction_introduction);

        console.log("Regular EC trials 2 before pushing:", regular_ec_trials_list.timeline);
          if (regular_ec_trials2_list.timeline.length > 0) {
              console.log("Adding regular_ec2 trials to main timeline");
              for (let trial of regular_ec_trials2_list.timeline) {
                  timeline.push(trial);
              }
          } else {
              console.error("regular_ec_trials2_list.timeline is empty. Check trial setup.");
          }


        // Recalibration before specific trials
        timeline.push({
          timeline: [cali_vali_instructions, fixation_cali, fixation1],
          conditional_function: function () {
              // Check if the trial number is 12, 24, 36, 48 (or any other specific trials you want)
              return [12, 24, 36, 48].includes(jsPsych.data.get().trial_index);
          }
      });

//     console.log("Extinction before pushing:", extinction_list.timeline);
//         if (extinction_list.timeline.length > 0) {
//             console.log("Adding extinction trials to main timeline");
//             for (let trial of extinction_list.timeline) {
//                 timeline.push(trial);
//             }
//         } else {
//             console.error("extinction_list.timeline is empty. Check trial setup.");
//         }
//
//
//       // Recalibration before specific trials
//       timeline.push({
//         timeline: [cali_vali_instructions, fixation_cali, fixation1],
//         conditional_function: function () {
//             // Check if the trial number is 12, 24, 36, 48 (or any other specific trials you want)
//             return [12, 24, 36, 48].includes(jsPsych.data.get().trial_index);
//         }
//     });

        timeline.push(evaluation3_intro);
        timeline.push(evaluation3_procedure);
        timeline.push(estimate2);
        timeline.push(estimate2_individuals); 
        timeline.push(joint_occurence2_intro);
        timeline.push(joint_occurence2_procedure);
        timeline.push(word_rating2_intro);
        timeline.push(word_ratings2);
        timeline.push(demographics);
        timeline.push(visioncheck_trial);
        timeline.push(seriouscheck_trial);
        timeline.push(feedback);

          timeline.push(success_guard);
        
        jsPsych.run(timeline);
    }
    
