/**
 * Created by anshulagrawal on 2019-05-28.
 */

import { LightningElement, api, track, wire } from 'lwc';
import getMyClients from '@salesforce/apex/ClientLocationManagementController.getMyClients';

import labelError from '@salesforce/label/c.Error';
import labelNoData from '@salesforce/label/c.labelNoClientData';
import labelMyClientsTitle from '@salesforce/label/c.labelMyClientsTitle';
import labelAccountNumber from '@salesforce/label/c.labelAccountNumber';
import labelAccountName from '@salesforce/label/c.labelAccountName';
import labelDateOfBirth from '@salesforce/label/c.labelDateOfBirth';
import labelTelephone from '@salesforce/label/c.labelTelephone';
import labelSalutation from '@salesforce/label/c.labelSalutation';

export default class myClients extends LightningElement {

    @track loading = true;

    @track error = false;

    @track displayClientData = true;

    @track sortedBy ='accountNumber';

    @track sortedDirection = 'asc';

    myClientData;

    label = {
        labelError,
        labelTelephone,
        labelNoData,
        labelMyClientsTitle,
        labelAccountNumber,
        labelAccountName,
        labelDateOfBirth,
        labelSalutation
    };

    /**
     * Get my clients
     * @param {object} error
     * @param {object} data
     */
    @wire(getMyClients)
    wiredAccountNewsResponse({ error, data }) {
        if (data) {
            if (data === undefined || data.values === undefined || data.values.length === 0)
            {
                this.displayClientData = false;
            } else {
                console.log('data values >>'+data.values);
                this.myClientData = data.values;
                this.displayClientData = true;
            }
            this.loading = false;
        } else if (error){
            this.loading = false;
            this.error = true;
        }
    }

    columns = [
        {label: this.label.labelAccountNumber, fieldName: 'accountNumber' ,type: 'ID'},
        {label: this.label.labelSalutation, fieldName: 'salutation', type: 'text'},
        {label: this.label.labelAccountName ,fieldName: 'recordLink', type: 'url', typeAttributes: {label: { fieldName: 'accountName' }, target: '_self'}},
        {label: this.label.labelDateOfBirth, fieldName: 'dateOfBirth', type: 'date' , format:'DD-MM-YYYY', typeAttributes: { year: 'numeric', month:'2-digit',day:'2-digit' }}
    ];

    sortData(fieldName, sortDirection){
        var data = this.myClientData;
        //function to return the value stored in the field
        var key =(a) => a[fieldName];
        var reverse = sortDirection === 'asc' ? 1: -1;
        data.sort((a,b) => {
            let valueA = key(a) ? key(a).toLowerCase() : '';
        let valueB = key(b) ? key(b).toLowerCase() : '';
        return reverse * ((valueA > valueB) - (valueB > valueA));
    });

        //set sorted data to opportunities attribute
        this.myClientData = data;
    }

    updateColumnSorting(event){
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;
        this.sortData(this.sortedBy,this.sortedDirection);
    }

}