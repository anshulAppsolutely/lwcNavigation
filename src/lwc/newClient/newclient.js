/**
 * Created by anshulagrawal on 2019-06-07.
 */

import { LightningElement, wire, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getRecordTypeId from '@salesforce/apex/ClientLocationManagementController.fetchRecordTypeId';

export default class newclient extends LightningElement {

    @api recordTypeName;

    @track recordTypeId;
    personBirthDate;

    @wire(getRecordTypeId , { recordTypeName: '$recordTypeName' })
    wiredRecordType({ error, data }) {
        if (data) {
            this.recordTypeId = data;
            console.log('record id fetched >>'+this.recordTypeId);
        } else if (error) {
            console.log('Record Type is not fetched');
        }
    }

    handleSuccess(event) {
        const evt = new ShowToastEvent({
            title: "Account created",
            message: "Record ID: "+ event.detail.id,
            variant: "success"
        });
        this.dispatchEvent(evt);
    }

    handleSubmit(event) {
        console.log('in submit >>');
        event.preventDefault();       // stop the form from submitting
        const fields = event.detail.fields;
        console.log(JSON.stringify(event.detail));
        //fields.Street = '32 Prince Street';
        fields.PersonBirthdate = this.personBirthDate;
        //fields.AccountId = '0011j00000CRaWoAAL';
        console.log('person date >>'+fields);
        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    handleBirthDateChange(event){
        this.personBirthDate = event.detail.value;
    }


}