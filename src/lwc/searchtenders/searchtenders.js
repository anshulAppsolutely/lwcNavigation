/**
 * Created by tejaswinidandi on 08/04/2019.
 */

import {LightningElement, api, wire, track} from 'lwc';
import apexSearch1 from '@salesforce/apex/LookupController.searchTenders';
import fetchUserType from '@salesforce/apex/LookupController.fetchUserType';

// Import custom labels
import searchTenders from '@salesforce/label/c.Search_Tenders';
import andSearch from '@salesforce/label/c.AND_Search';
import orSearch from '@salesforce/label/c.OR_Search';
import notSearch from '@salesforce/label/c.NOT_including';
import search from '@salesforce/label/c.Search';
import searchKeywords from '@salesforce/label/c.Search_keywords';
import searchPolicydocuments from '@salesforce/label/c.Search_Policy_documents';
import searchusing from '@salesforce/label/c.Search_Using';
import currentTenders from '@salesforce/label/c.Current_Tenders';
import futureTenders from '@salesforce/label/c.Future_Tenders';
import marketinformation from '@salesforce/label/c.Market_Information';
import noResults from '@salesforce/label/c.No_Results';
import tenders from '@salesforce/label/c.Tenders';
import tenderName from '@salesforce/label/c.Tender_Name';
import documents from '@salesforce/label/c.Documents';
import documentName from '@salesforce/label/c.Document_Name';
import labelAuthorityName from '@salesforce/label/c.Authority_Name';
import labelPublicVisitor from '@salesforce/label/c.Public_Visitor_Message';

export default class Searchtenders extends LightningElement {
    @track searchTerm1 = '';
    @track searchTermAnd = '';
    @track searchTermOr = '';
    @track searchTermNot = '';

    @track showTable = false;
    @track showDoc = false;
    /*@track isCurrentTenders = true;
    @track isFutureTenders = true;
    @track isHistoricTenders = true;*/
    @track noResults = '';

    @api results;
    // @api totalNumberOfRows;
    // @track loadMoreStatus
    // MAX_SIZE = 1000;

    @api tenderFilter;

    @track data = [];
    @track error;

    // Expose the labels to use in the template.
    label = {
        searchTenders,
        andSearch,
        orSearch,
        notSearch,
        search,
        searchKeywords,
        searchPolicydocuments,
        searchusing,
        currentTenders,
        futureTenders,
        marketinformation,
        noResults,
        tenderName,
        tenders,
        documentName,
        documents,
        labelAuthorityName,
        labelPublicVisitor
    };

    @track columns = [{
        label: this.label.tenderName, fieldName: 'Record_Link__c', type: 'url',typeAttributes: {label: { fieldName: 'Name' }, target: '_self'}},
        //{label: 'Title', fieldName: 'Title__c', type: 'text', sortable: true},
        {label: this.label.labelAuthorityName, fieldName: 'Authority_name__c', type: 'text', sortable: true}

    ];//label: 'Tender name', fieldName: 'linkName', type: 'url', sortable: true, typeAttributes: {label: { fieldName: 'Name' },value:{fieldName: 'linkName'}, target: '_blank'}


    changeHandler(event) {
        this.searchTerm1 = event.target.value;
    }
    changeHandlerAnd(event) {
        this.searchTermAnd = event.target.value;
    }
    changeHandlerOr(event) {
        this.searchTermOr = event.target.value;
    }
    changeHandlerNot(event) {
        this.searchTermNot = event.target.value;
    }

    /*handleCurrentTenderType(event) {
        this.isCurrentTenders = event.target.checked;
    }
    handleFutureTenderType(event) {
        this.isFutureTenders = event.target.checked;
    }
    handleHistoricTenderType(event) {
        this.isHistoricTenders = event.target.checked;
    }*/

    isLoggedInUser;
    @track showGuestMessage;

    @wire(fetchUserType)
    wiredCheckUser({ error, data }) {
        if (data) {
            this.isLoggedInUser = data;
        } else if (error) {
            console.log('user is not fetched');
        }
    }

    showAccessMessage(e){
        e.preventDefault();

        this.showGuestMessage = true;
        console.log('on click >> '+this.showAccessMessage);
        return false;
    }

    handleSearchAnd() {
        apexSearch1({ searchTerm: this.searchTerm1, searchTermAnd: this.searchTermAnd, searchTermOr: this.searchTermOr, searchTermNot: this.searchTermNot,
            tenderSearchFilter: this.tenderFilter })
            .then(result => {
                this.results = result;//JSON.stringify(
                if (result.length > 0) {
                    if (result[0].tenders != null) {
                        this.data = result[0].tenders;
                        // this.totalNumberOfRows = result[0].tenders.length;
                        this.showTable = true;
                        this.error = undefined;
                        //console.log('user type >>'+isLoggedInUser);
                    }
                    else {
                        this.data = null;
                        this.showTable = false;
                        this.noResults = 'No Tenders found';
                    }
                    //if (result.length > 1) {
                    this.showDoc = true;
                }
                else {
                    this.noResults = noResults;
                }
                this.showGuestMessage = false;


            })
            .catch(error => {
                this.error = error;
                this.showDoc = false;
                this.showTable = false;
                this.noResults = noResults;
            });

    }

    /*loadMoreData(event) {
        //Display a spinner to signal that data is being loaded
        event.target.isLoading = true;
        //Display "Loading" when more data is being loaded
        this.loadMoreStatus = 'Loading';
        addData({ isCurrent: this.isCurrentTenders, isFuture: this.isFutureTenders, isHistoric: this.isHistoricTenders, existingTendersSize: this.totalNumberOfRows })
            .then(result => {
                if (result.length >= this.MAX_SIZE) {
                    event.target.enableInfiniteLoading = false;
                    this.loadMoreStatus = 'No more data to load';
                } else {
                    const currentData = this.data;
                    //Appends new data to the end of the table
                    const newData = currentData.concat(result);
                    this.data = newData;
                    this.loadMoreStatus = '';
                }
                event.target.isLoading = false;
            });
    }

    /*@wire(apexSearch,{searchTerm: "$searchTerm1"})

    wiredTenders({error, data}) {
        if (data) {
            var b = Object.assign({}, data);
            var a  = JSON.parse(JSON.stringify(b));

            // a.forEach(function(record){
            //     console.log('1.5)'+JSON.stringify(record, null, '\t'));
            //     record.linkName = '/'+record.Id;
            // }); hgfgjh bgggy

            for (var i = 0; i < data.length; i++) {
                console.log('1.5)'+(a[i]));
                if(a[i].linkName) a[i].linkName = '/'+a[i].Id;
            }

            this.data = a;
            console.log('2)'+data);
            console.log(JSON.stringify(data, null, '\t'));
        } else if (error) {
            this.error = error;
        }
    }
    /*handleSearch() {
        apexSearch({ searchTerm: this.searchTerm1, searchTermAnd: this.searchTermAnd, searchTermOr: this.searchTermOr, searchTermNot: this.searchTermNot})
            .then(result => {
                // result.forEach(function(record){
                //     record.linkName = '/'+record.Id;
                // });

                        // result[0].tenders.forEach(function (record) {
                        //     console.log(JSON.stringify(record));
                        //     record.linkName = '/' + record.Id;
                        // });
                this.data = result;
                this.showTable = true;
                this.error = undefined;

            })
            .catch(error => {
                this.error = error;
                this.data = undefined;
                this.showTable = false;
            });

    }*/
}