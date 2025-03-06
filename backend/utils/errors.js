class SpotErrors extends Error {
    constructor (message, status){
        super(message)
        this.status
    }
    throw(){
        throw this;
    }
}




const mySpotErorr = new SpotErrors("Bad request.", 400).throw()