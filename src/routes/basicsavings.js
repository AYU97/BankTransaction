const express = require('express')
const app = express();
const BasicSavings = require('../models/BasicSavings')
const Savings = require('../models/Savings')
const Current = require('../models/Current')
const auth = require('../middleware/auth')

app.post('/api/create-basic-acc',auth,async (req, res) => {
    const basicSavings = new BasicSavings({
        type:'BasicSavings Account',  
        balance:0,
        owner:req.user._id
    })

    try {
       const account = await BasicSavings.findOne({owner: req.user._id })
        if(!account){
                await basicSavings.save()
                res.status(201).send(basicSavings)
        }
        else{
            res.status(500).send("basic savings account already exists")
        }
    } catch (e) {
        res.status(400).send(e)
    }
})

app.post('/api/add-money-basicown',auth,async (req, res) => {
  
try {
     const account = await BasicSavings.findOne({owner: req.user._id })
     if(account){
        const currentBasicBal = account.balance
        const newBasicBal = parseFloat(currentBasicBal) + parseFloat(req.body.balance)
        if(newBasicBal<=50000){
            await BasicSavings.updateOne({owner: req.user._id },
                { $set: { "balance" : newBasicBal } })
            const accountNew = await BasicSavings.findOne({owner: req.user._id })
                res.status(201).send(accountNew)
            }
            else{
                res.status(500).send("can not add more than 50000 in basic savings")
            }
        }     
      else{
          res.status(500).send("basic savings account doesn't exists")
      } 
     
  } catch (e) {
      res.status(400).send(e)
  }
})


app.post('/api/transfer-basic-to-savings',auth,async (req, res) => {
    const _id = req.body.id
    const balance = req.body.balance  
    const owner= JSON.stringify(req.user._id)
      try {
         //savings    
         const transferAccount = await Savings.findById({_id}) 
         if(transferAccount){
            const ownerSend = JSON.stringify(transferAccount.owner)
            if(owner !== ownerSend){
               
                const account = await BasicSavings.findOne({owner: req.user._id })
                const currentBasicBal = account.balance
                const currentSavBal = transferAccount.balance
                const availBal = parseFloat(currentBasicBal) - parseFloat(balance)
                const newSavBal = parseFloat(currentSavBal) + parseFloat(balance)
                if(availBal>0){
                await Savings.updateOne({_id},
                    { $set: { "balance" : newSavBal}})
              
              //basic       
                   await BasicSavings.updateOne({owner: req.user._id },
                       { $set: { "balance" : availBal}})
       
                   const accountNew = await BasicSavings.findOne({owner: req.user._id })
                       res.status(201).send(accountNew)
         
               }
               else{
                res.status(500).send("not enough funds, please check")
               }
               
         }
         else{
            res.status(500).send("can not send to your own account")
        } 
       
         }
         else{
            res.status(500).send("account doesn't exists, please check")

           }
             } catch (e) {
          res.status(400).send(e)
      }
  })



app.post('/api/transfer-basic-to-current',auth,async (req, res) => {
    const _id = req.body.id
    const balance = req.body.balance 
    const owner= JSON.stringify(req.user._id)
 
      try {
         //current    
         const transferAccount = await Current.findById({_id})
         if(transferAccount){
            const ownerSend = JSON.stringify(transferAccount.owner)
            if(owner !== ownerSend){
               const currentBal = transferAccount.balance
               const newCurrBal = parseFloat(currentBal) + parseFloat(balance)
               const account = await BasicSavings.findOne({owner: req.user._id })
               const currentBasicBal = account.balance
               const availBal = parseFloat(currentBasicBal) - parseFloat(balance)
               if(availBal>0){
                await Current.updateOne({_id},
                    { $set: { "balance" : newCurrBal}})
              
              //basic
             
                   await BasicSavings.updateOne({owner: req.user._id },
                       { $set: { "balance" : availBal}})
       
                   const accountNew = await BasicSavings.findOne({owner: req.user._id })
                       res.status(201).send(accountNew)
               }
               else{
                res.status(500).send("not enough funds ,please check")
               }
              
            }
            else{
               res.status(500).send("can not send to your own account")
              }
   
         }
         else{
            res.status(500).send("account doesn't exists, please check")
        }  
        
         
      } catch (e) {
          res.status(400).send(e)
      }
  })




app.post('/api/transfer-basic-to-basic',auth,async (req, res) => {
    const _id = req.body.id
    const balance = req.body.balance 
    const owner= JSON.stringify(req.user._id)
 
      try {
         //basic    
         const transferAccount = await BasicSavings.findById({_id}) 
         if(transferAccount){
            const ownerSend = JSON.stringify(transferAccount.owner)
            if(owner !== ownerSend){
               const currentBal = transferAccount.balance
               const newCurrBal = parseFloat(currentBal) + parseFloat(balance)
               const account = await BasicSavings.findOne({owner: req.user._id })
               const currentBasicBal = account.balance
               const availBal = parseFloat(currentBasicBal) - parseFloat(balance)
               if(availBal>0){
                if(newCurrBal<=50000){
                    await BasicSavings.updateOne({_id},
                        { $set: { "balance" : newCurrBal}})
                  
                  //basic
                 
                       await BasicSavings.updateOne({owner: req.user._id },
                           { $set: { "balance" : availBal}})
           
                       const accountNew = await BasicSavings.findOne({owner: req.user._id })
                           res.status(201).send(accountNew)
               }
            
            else{
               res.status(500).send("basic savings account limit of 50,000 exceeded")
           }
           }   else{
                res.status(500).send("not enough funds please check")
               }
              
                
           }
                else{
                   res.status(500).send("can not send to your own account")
                  }    
         }
         else{
            res.status(500).send("account doesn't exists,please check")
        }      
                  
      } catch (e) {
          res.status(400).send(e)
      }
  })



app.get('/api/basic-balance',auth, async (req, res) => {
   
    try {
        const basicSavings = await BasicSavings.find({owner: req.user._id })

        if (!basicSavings) {
           res.status(404).send("no basicSavings account found")
        }
        res.status(200).send(basicSavings)
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = app