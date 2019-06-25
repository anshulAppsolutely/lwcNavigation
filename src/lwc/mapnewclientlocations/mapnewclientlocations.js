/**
 * Created by anshulagrawal on 2019-05-28.
 */

import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord } from 'lightning/uiRecordApi';
import CLIENT_LOCATION_OBJECT from '@salesforce/schema/Client_Location_Relationship__c';
import CLIENT_FIELD from '@salesforce/schema/Client_Location_Relationship__c.Client_PA__c';
import LOCATION_FIELD from '@salesforce/schema/Client_Location_Relationship__c.Location__c';
import STARTDATE_FIELD from '@salesforce/schema/Client_Location_Relationship__c.StartDate__c';
import getMyLocations from '@salesforce/apex/ClientLocationManagementController.getMyLocations';
import getSubLocations from '@salesforce/apex/ClientLocationManagementController.getSubLocations';

import labelError from '@salesforce/label/c.Error';
import labelNoData from '@salesforce/label/c.labelNoLocations';
import labelNoSubLocations from '@salesforce/label/c.labelNoSubLocations';
import labelLocation from '@salesforce/label/c.labelLocation';
import labelSelectLocation from '@salesforce/label/c.labelSelectLocation';
import labelLocationDateMissing from '@salesforce/label/c.labelLocationDateMissing';
import labelOrganization from '@salesforce/label/c.labelOrganization';
import labelMyLocation from '@salesforce/label/c.labelMyLocation';
import labelSubLocation from '@salesforce/label/c.labelSubLocation';
import labelStartDate from '@salesforce/label/c.labelStartDate';
import labelMyLocationMissing from '@salesforce/label/c.labelMyLocationMissing';

export default class Mapnewclientlocations extends LightningElement {

    @track loading = true;

    @api recordId;

    @track error = false;

    @track displayLocationsData = true;
    @track displaySubLocationsData = false;
    @track displayNoSubLocationsMsg = false;

    @track subLocations;

    @api startDate;

    @api validity = false;

    @track mySubLocations;

    @track mylocations;

    @track mappedlocations = [];

    @track myOrganization;
    selectedRows;

    label = {
        labelError,
        labelNoData,
        labelNoSubLocations,
        labelLocation,
        labelSelectLocation,
        labelLocationDateMissing,
        labelOrganization,
        labelMyLocation,
        labelSubLocation,
        labelStartDate,
        labelMyLocationMissing
    };

    selectedLocation;

    columns = [
        {label: 'Ruimtes', fieldName: 'locationName' ,type: 'text'}
    ];

    /**
     * Get my mylocations
     * @param {object} error
     * @param {object} data
     */
    @wire(getMyLocations, { clientId : '$recordId' })
    wiredLocationPickList({ error, data }) {
        if (data) {
            console.log('i am in data my record id >>>'+this.recordId);
            this.myOrganization = data.myOrganization;
            if (data === undefined || data.myLocations === undefined || data.myLocations.length === 0)
            {
                this.displayLocationsData = false;
            } else {
                console.log('data values >>'+data.myLocations);

                this.mylocations = JSON.parse(data.myLocations);
                this.mappedlocations = JSON.parse(data.mappedLocations);
                this.displayLocationsData = true;
            }
            this.loading = false;
        } else if (error){
            console.log('i am in error ');
            this.loading = false;
            this.error = true;
        }
    }



    handleLocationChange(event) {
        event.preventDefault();
        this.selectedLocation = event.target.value;
        this.selectedRows = '';
        this.loading = true;
        this.startDate = '';
        this.displaySubLocationsData = false;
        this.displayNoSubLocationsMsg = false;
        console.log('mapped locations 11 >>>'+this.mappedlocations);

        getSubLocations({ parentLocation: this.selectedLocation, clientId: this.recordId })
            .then((result) => {
                if (result === undefined || result.mySubLocations === undefined || result.mySubLocations.length === 0)
                {
                    this.displayNoSubLocationsMsg = true;
                }else{
                    this.subLocations = result.mySubLocations;
                    this.displaySubLocationsData = true;
                }
                this.loading = false;
                console.log('my sub locations >>'+this.subLocations);
            }).catch((error) => {
                this.loading = false;
                this.error = true;

            });

    }

    handleDateChange(evt) {
        evt.preventDefault();
        this.startDate = evt.target.value;
    }

    getSelectedName(event) {
        this.selectedRows = event.detail.selectedRows;
    }

    /**
     * create locations
     * @param {*} evt
     */
    createLocations(evt) {
        evt.preventDefault();
        console.log('start date'+this.startDate);
        console.log('location >>'+this.selectedLocation);
        console.log('checking mapped val');
        var self = this;
        const selectedObject = this.mappedlocations.filter(mappedLocation => mappedLocation.locationId === this.selectedLocation);
        /*let selectedObject  = this.mappedlocations.find(function(element){
            return element.locationId === event.target.value;
        });*/
        console.log('selectedObject mapped >>>>'+selectedObject);
        const allValid = [...this.template.querySelectorAll("[data-field='input1']")]
            .reduce((validSoFar, inputCmp) => {
                inputCmp.reportValidity();
                return validSoFar && inputCmp.checkValidity();
            }, true);

        if (!allValid) {
            return;
        }
        console.log('i am in create');
        console.log(' main location already created slected if its blank'+selectedObject);
        if(selectedObject != null && selectedObject != '' && selectedObject != undefined){

            // Display that fieldName of the selected rows
            console.log('creating main location also ');
            const fields = {};
            fields[CLIENT_FIELD.fieldApiName] = this.recordId;
            fields[LOCATION_FIELD.fieldApiName] = this.selectedLocation;
            fields[STARTDATE_FIELD.fieldApiName] = this.startDate;
            const recordInput = { apiName: CLIENT_LOCATION_OBJECT.objectApiName, fields };
            const selectedRowsSize = this.selectedRows.length;
            var counter = 0;
            createRecord(recordInput)
                .then(() => {
                for (let i = 0; i < this.selectedRows.length; i++){
                //alert("You selected: " + this.selectedRows[i].locationId);
                const fields = {};
                fields[CLIENT_FIELD.fieldApiName] = this.recordId;
                fields[LOCATION_FIELD.fieldApiName] = this.selectedRows[i].locationId;
                fields[STARTDATE_FIELD.fieldApiName] = this.startDate;
                const recordInput = { apiName: CLIENT_LOCATION_OBJECT.objectApiName, fields };
                createRecord(recordInput)
                    .then((clientLocation) => {
                    console.log('client location created >'+clientLocation.id);
                    counter++;

                });
            }
            }).then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Locations are mapped.',
                            variant: 'success'
                        }),
                    );
            }).catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error creating Location',
                            message: error.body.message,
                            variant: 'error',
                        }),
                    );
            });


        }else{

            if(this.selectedRows.length == 0){
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'There are no spaces selected.',
                        variant: 'success'
                    }),
                );
                return;
            }

            console.log('creating only sub location  '+this.selectedRows.length);
            const selectedRowsSize = this.selectedRows.length;
            const selectedRows1 = this.selectedRows;
            const startDate = this.startDate;
            const recordId1 = this.recordId;
            var promise1 = new Promise(function(resolve, reject) {
                console.log('inside sub location');
                var counter = 0;
                for (let j = 0; j < selectedRowsSize ; j++){
                    //alert("You selected: " + this.selectedRows[i].locationId);

                    const fields = {};
                    fields[CLIENT_FIELD.fieldApiName] = recordId1;
                    fields[LOCATION_FIELD.fieldApiName] = selectedRows1[j].locationId;
                    fields[STARTDATE_FIELD.fieldApiName] = startDate;
                    const recordInput = { apiName: CLIENT_LOCATION_OBJECT.objectApiName, fields };
                    createRecord(recordInput)
                        .then((clientLocation) => {
                        console.log('only sub client location created >'+clientLocation.id);
                        counter++;
                        if(selectedRowsSize ==  counter ) resolve();
                    }).catch(error => {
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: 'Error creating Location',
                                    message: error.body.message,
                                    variant: 'error',
                                }),
                            );
                        reject();
                    });

                }

            });

            promise1.
            then(function () {
                console.log('Success, You are a GEEK');
                self.showToast();
            }).
            catch(function () {
                console.log('Some error has occured while creating Client Locations');
            });

        }

    }

    showToast(){
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Location are mapped with Sublocations.',
                variant: 'success'
            })
        );
    }

        /*if (!this.startDate || this.startDate.trim().length === 0) {
            this.validity = false;
            return;
        }*/






}
