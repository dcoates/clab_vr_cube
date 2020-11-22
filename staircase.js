'use strict';

    function generate_ori(nafc) {
        var ori;
        if (nafc==4) {
            ori=getRandomInt(4)*90;
        } else if (nafc==2) {
            ori=getRandomInt(2)*180; // (0 or 1) * 180 : L or R
        } else if (nafc==3) {
            ori=getRandomInt(3);
	}
        return ori;
    }

/* Needed to fix staircase:
  1) get_metap (fill with trial params?)
  2) execute trial
  3) specify normalization logic (i.e., for contrast, need lum of backgrund)
  4) what to do when completed
  5) Update UI: give current value to update Fn
*/

/* metap={
	staircase_reversals:[1.26,1.26,1.26,1.26,1.12,1.12,1.12,1.12],
	stair_start:32,
mocs_spacings:[1.25,1.75,2,2.5,3,5,99],
	mocs_repeats:10}
*/

/* trial_params={
	orientation: 0,
	size:32
}*/

    // Base class:
    // - curr_trial (woolean, size, etc.)
    // - trial_history   

    class staircase {
   	trial_next={};

            constructor(value_initial,stair_Nup,reversals,nafc) { // TODO: remove AFC
                this.stair_Nup=stair_Nup; // N-up-1down
                this.reversals=reversals; // List of reversal values
                this.restart(value_initial,nafc); 
                this.plot_log=false;

		// Initialize to something sensible: (just in case)
   		this.trial_next['value']=1.0;
   		this.trial_next['which']=0.0;
            }

            restart(value_initial,nafc) {
                this.stair_trial=0;
                this.consecutive_corrects=0;
                this.threshold=value_initial;
                this.nReversalsCompleted=0;
                this.prev_corr=true; // assume first one correcta (still going "down")
                this.trial_history=[];
                this.nafc=nafc;

   		this.trial_next['value']=this.threshold;	// the previous this.value might be wrong
   		this.trial_next['which']=0;		// random something
            }

		get_trial() {
			return this.trial_next;
		}

            next() {
		//console.log();
                do_trial();  // TODO: refactor out of UI

                this.stair_trial += 1;
                this.compute_mean();

                var val=this.mean_cm/1.0; //parseFloat(get_value('background')); //TODO
                var s=`Stair trial:${this.stair_trial} revs:${this.nReversalsCompleted} threshold=${val.toPrecision(5)}`;
		append_value('status',s); // TODO: UI

                // Did enough reversals? 
                if (this.nReversalsCompleted>this.reversals.length ) { // TODO: rmv from UI
                    set_checked( "chkStair", false);
                }
            }

            compute_mean() {
                var revs_last=this.trial_history
                    .filter(t1=>t1.is_reversal)         // extract reversals
                    .filter( (word,idx,arr) => idx>1)   // remove first two

                if (revs_last.length>0) {
                    this.mean_last=revs_last.reduce( (total,t1)=>t1.size+total,0)/revs_last.length
                } else {
                    this.mean_last=0;
                }

                if (this.plot_log==true) { // Hack: means probably contrast, don't divide out cm
                    this.mean_cm=this.mean_last;
                } else {
                    this.mean_cm=this.mean_last/200.0*200.0; //get_value("box_size"); //TODO
                }
            }

            update(resp) {
            	var correct=(resp==this.trial_next['which']);
                var isReversal = false;

                // N-up-1-down logic
                if (true) {
                    var step_size=this.reversals[this.nReversalsCompleted];
                    var prev_value=this.threshold;

                    if (correct) {
                        this.consecutive_corrects+=1;
                        if (this.consecutive_corrects==this.stair_Nup ){
                            this.threshold /= step_size;
                            this.consecutive_corrects=0;
                            if (! (this.prev_corr)) {
                                isReversal=true; // first reversal after an error
                            } else {
                                isReversal=false; // still going up
                            }
                            this.prev_corr=true;
                        } else {
                            // First correct of sequence, shouldn't yet change prev_corr, etc.
                            ;
                        }
                    } else {
                        this.threshold *= step_size;
                        this.consecutive_corrects=0;
                        if (this.prev_corr) {
                            isReversal=true; // first wrong after previous correct is considered reversal
                        }
                        this.prev_corr=false;
                    }

                    if (isReversal) {
                        this.nReversalsCompleted += 1;
                    }

                    // Log response -- TODO move out bad UI spaghetti , maybe log elsewhere, not just UI
			/*
                    set_html("log",get_html("log")+"\n"+
                        this.stair_trial+","+prev_value+","+trial_params['orientation']+','+ori_resp+','+correct+','+isReversal+','+this.nReversalsCompleted);
			*/

                    var trial1={'num':this.stair_trial, 'size':prev_value, 'ori': this.trial_next['which'],
                        'resp': resp, 'is_correct': correct, 'is_reversal': isReversal, 'num_reversals':
                        this.nReversalsCompleted, 'dir_reversal_down': this.prev_corr, 'x': this.stair_trial, 'y': prev_value};
						// Make aliases for x and y just to make drawing easier

                    this.trial_history.push(trial1);

                    if (this.plot_log) {
                        trial1.y = Math.log10(trial1.y)*25.0+100.0 
                    };

			/* 
                    update_graph(trial1) //this.trial_history[this.trial_history.length-1]);
					app1(this.trial_history); // TODO
			*/

                    // Get next one:
                    var oriNew=generate_ori(this.nafc) 

                    // Set up trial parameters, which are merged with the code to do 1 trial
/*
                    set_value("trial",`trial_params={\n\torientation: ${oriNew},
                        \n\tsize:${this.threshold},
                        \n\tcontrast:${this.contrast}
                    }`);
*/

			this.trial_next['which']=oriNew;
			this.trial_next['value']=this.threshold; // redundant?

                    // Finished ?
                    if (this.nReversalsCompleted>=this.reversals.length ) {
                        set_checked( "chkStair", false); // TODO: out of UI
                	var val=this.mean_cm/parseFloat(get_value('background'));
                        set_html("lblStair",`FINISHED threshold=${val.toPrecision(4)}`);
                        //beep(1,440,80);
                    } else {
                        this.next(); // execute next
                    }
                }
            };
        }

    class MOCS {
            constructor() {
            }

            restart(levels,repeats,nafc) {
                this.levels=levels; 
                this.repeats=repeats;
                this.num_trial=0;
                this.nafc=nafc;

                var remaining=[]; // bc can't access 'this' in forEach (?)
                this.levels.forEach(function(entry) { // List of valid trials yet to run
                    var level1={}
                    level1['which']=entry;
                    level1['remaining']=repeats;
                    remaining.push(level1);
                });
                this.remaining=remaining;
                };

            total_remaining() {
                var total=0;
                this.remaining.forEach(function(entry) { // List of valid trials yet to run
                    total += entry['remaining'];
                });
                return total;
            }

            update(correct,ori_resp) {

                set_html("log",get_html("log")+"\n"+
                    this.num_trial+","+this.remaining[this.index_which]['which']+","+trial_params['orientation']+','+ori_resp+','+correct+',0,0');

                var spac=this.remaining[this.index_which]['which']
                if (spac<10) {
                    var yloc=spac*15; // CC spacings times ten
                } else {
                    var yloc=90;
                }
                var xloc=this.total_remaining()/2.0; // from right to left
                var trial1={'is_correct': correct, 'x': xloc, 'y':yloc };
                update_graph(trial1);

                set_html("lblStair",`MOCS ${this.total_remaining()}`); //TOTAL

                this.remaining[this.index_which]['remaining'] -= 1;
                if (this.remaining[this.index_which]['remaining']==0) {
                    this.remaining.splice(this.index_which,1); // remove 1 item from middle of array
                }

                // Finished ?
                if (this.remaining.length < 1 ) {
                    set_checked( "chkStair", false); // TODO: out of UI
                    set_checked( "chkMOCS", false); // TODO: out of UI
                    set_html("lblStair","FINISHED");
                    //beep(1,440,80);
                } else {
                    this.next(); // execute next
                }
            };

            next() {
                this.index_which=getRandomInt(this.remaining.length);

                // Get random orientation
                var oriNew=getRandomInt(4)*90

                // Set up trial parameters, which are merged with the code to do 1 trial
                set_value("trial",`trial_params={\n\torientation: ${oriNew},\n\tsize:`+
                        this.remaining[this.index_which]['which']+"\n}");

                do_trial(); // TODO: figure out better place for this
            };
        }; // MOCS class


    var num_manual_trial=0;      // trial count
    var prev_answered=false;     // was previous trial answered already?

    function manual_trial(which_size,nafc,is_YN) {
        // Get random orientation
        var oriNew=generate_ori(nafc);
        if (is_YN) {oriNew=0}; // for Y/N task, always right-pointed

        // Set up trial parameters, which are merged with the code to do 1 trial
        set_value("trial",`trial_params={\n\torientation: ${oriNew},\n\tsize: ${map_size[which_size]}\n}`);

        do_trial(); // TODO: figure out better place for this

        prev_manual_trial={'ori':oriNew, 'size': which_size};
        prev_answered=false;
        num_manual_trial += 1;
    }

    // TODO: This UI doesn't really belong here
    function update_manual_table_corr(nwhich,correct) {
        var thisid='count_'+nwhich;
        var strCurrent=get_html(thisid);
        var fields=strCurrent.split('/');
        set_html(thisid,(parseInt(fields[0])+correct)+'/'+fields[1]);
    }
    function update_manual_table_outof(nwhich) {
        var thisid='count_'+nwhich;
        var strCurrent=get_html(thisid);
        var fields=strCurrent.split('/');
        set_html(thisid,fields[0]+'/'+(parseInt(fields[1])+1));
    }

    // https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
    function export_manual_table() {
        var s = "";
        s += "size,num_correct,num_presented";
        s += ","+get_value("text_condition") + "\n";
        for (var nrow = nrows_mocs_table; nrow>=0; nrow--) {
            var thisid='count_'+nrow;
            strCurrent=get_html(thisid);
            fields=strCurrent.split('/');
            // Only output cells for which one has been presented
            if (parseInt(fields[1])>0) {
                s+=nrow+","+fields[0]+","+fields[1]+"\n"
            }
        }
        log.info(s)
        set_html("log",s)

        var owner=document.getElementById("table_text") 
        owner.style.display="";
        owner.hidden=false;

        var el=document.getElementById("log") //.select();
        var success= iosCopyToClipboard(el);
        //success=navigator.clipboard.writeText(s);

        owner.style.display="none";
        owner.hidden=true;
    }

    function iosCopyToClipboard(el) {
        var range = document.createRange();

        el.contentEditable = true;
        el.readOnly = false;
        el.focus()
        el.select()
        range.selectNodeContents(el);

        var s = window.getSelection();
        s.removeAllRanges();
        s.addRange(range);

        el.setSelectionRange(0, 999999); // A big number, to cover anything that could be inside the element.

        document.execCommand('copy');
    }

    function process_manual(ori_resp, is_YN,allow_multiple) {
        if ((!allow_multiple) && prev_answered) {
            return;
        } // noop if they already responded to this trial.
        
        prev_answered=true; // ...now they have!

        var correct=(ori_resp==prev_manual_trial['ori']);
        var nwhich=prev_manual_trial['size'];
        if (is_YN) {
            if (nwhich==0 && ori_resp==180) { // for Y/N trials, left&absent is correct,
                correct=true;
            } else {
                if(nwhich!=0 && ori_resp==0) { // right&present is correct
                    correct=true;
                } else {
                    correct=false;
                };
            }
        };
        log.info(correct);
        update_manual_table_corr(nwhich,correct);

        // Rescale our linear indexed scale (0-15) to the actual size scale, although sizes won't correspond
        // Button one is a phantom button to leave space
        var ylocGraph=(nwhich)*98/nrows_mocs_table;
        var trial1={'is_correct': correct, 'x': num_manual_trial-1, 'y':ylocGraph };
        update_graph(trial1);
        //app1(this.trial_history); // TODO
    }
