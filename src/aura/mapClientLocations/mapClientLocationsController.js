({
	myAction : function(component, event, helper) {
		
	},
    
    refreshView: function(component, event) {
    	// refresh the view
    	console.log('i am in refresh ');
    	$A.get('e.force:refreshView').fire();
        console.log('i am in refresh 2');
    },
    
    isRefreshed: function(component, event, helper) {
        location.reload();
    },

})