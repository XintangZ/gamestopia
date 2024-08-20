// jQuery start
$(() => {
    const userFeedback = [];

    const feedbackForm = $('#feedbackForm');
    const errorText = $('#errorText')

    // inputs 
    const feedbackEmail = $('#feedbackEmail');
    const feedbackImprove = $('#feedbackImprove');
    const feedbackDetails = $('#feedbackDetails');

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // valid email regex

        if(emailRegex.test(email)){
            return true;
        }else{
            return false;
        }
    }

    function getFeedBackString() {
        const selectedImprovementsArray = feedbackImprove.val(); // selected values array
        let selectedImprovementsString  = ''

        if(selectedImprovementsArray.length < 1){
            throw Error('You must select an option')
        }

        for (let i =0; i < selectedImprovementsArray.length; i++) {
            selectedImprovementsString +=`${selectedImprovementsArray[i]} `
        }

        return selectedImprovementsString;
    } 

    function getFeedback(e) {
        e.preventDefault();
        const email = feedbackEmail.val();
        const details = feedbackDetails.val();


        try {
            if(!validateEmail(email)){
                throw Error('Email invalid');
            }

            const feedbacObj ={
                email: email,
                improvementPoints: getFeedBackString(),
                details: details
            }

            userFeedback.push(feedbacObj);

        }catch(e) {
            errorText.html(e.message);
            console.log(e)
        };

        
    }

    feedbackForm.on('submit', e => getFeedback(e))

}) //jQuery end