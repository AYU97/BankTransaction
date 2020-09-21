const express = require('express')
const app = express();
const Savings = require('../models/Savings')
const BasicSavings = require('../models/BasicSavings')
const Current = require('../models/Current')
const auth = require('../middleware/auth')

app.post('/api/create-savings-acc',auth,async (req, res) => {
    const savings = new Savings({
        type:'Savings Account',  
        balance:0,
        owner:req.user._id
    })

    try {
       const account = await Savings.findOne({owner: req.user._id })
        if(!account){
                await savings.save()
                res.status(201).send(savings)
        }
        else{
            res.status(500).send("savings account already exists")
        }
    } catch (e) {
        res.status(400).send(e)
    }
})

app.post('/api/add-money-savingsown',auth,async (req, res) => {
try {
     const account = await Savings.findOne({owner:req.user._id})
     if(account){
        const currentSavBal = account.balance
        const newSavBal = parseFloat(currentSavBal) + parseFloat(req.body.balance)
            await Savings.updateOne({owner: req.user._id },
                { $set: { "balance" : newSavBal}})
            const accountNew = await Savings.findOne({owner: req.user._id })
                res.status(201).send(accountNew)
        }     
      else{
          res.status(500).send("savings account doesn't exists")
      } 
     
  } catch (e) {
      res.status(400).send(e)
  }
})


app.post('/api/transfer-saving-to-basic',auth,async (req, res) => {
    const _id = req.body.id
    const balance = req.body.balance  
    const owner= JSON.stringify(req.user._id)
      try {
       //basic
        
       const transferAccount = await BasicSavings.findById({_id })
       if(transferAccount){
        const ownerSend = JSON.stringify(transferAccount.owner)
        if(owner !== ownerSend){
         const currentBasicBal = transferAccount.balance
         const newBasicBal = parseFloat(currentBasicBal) + parseFloat(balance)
          const account = await Savings.findOne({owner: req.user._id}) 
          const currentSavBal = account.balance
          const availSavBal = parseFloat(currentSavBal) - parseFloat(balance)
          if(availSavBal>0){
            if(newBasicBal > 50000){
                res.status(500).send("basic savings account limit of 50,0000 exceeded")
            }
            else{
                await BasicSavings.updateOne({_id },
                    { $set: { "balance" : newBasicBal}})
    
            //savings    
             
             await Savings.updateOne({owner: req.user._id},
                 { $set: { "balance" : availSavBal}})
     
             const accountSav = await Savings.findOne({owner: req.user._id })
               res.status(200).send(accountSav)
             }
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
        res.status(500).send("account doesn't exists,please check")
    }         
      } catch (e) {
          res.status(400).send(e)
      }
  })



app.post('/api/transfer-saving-to-current',auth,async (req, res) => {
    const _id = req.body.id
    const balance = req.body.balance  
    const owner= JSON.stringify(req.user._id)

      try {
       //basic
       const transferAccount = await Current.findById({_id })
       if(transferAccount){
        const ownerSend = JSON.stringify(transferAccount.owner)
        if(owner !== ownerSend){
         const currentBal = transferAccount.balance
         const newCurrBal = parseFloat(currentBal) + parseFloat(balance)
         const account = await Savings.findOne({owner: req.user._id}) 
         const currentSavBal = account.balance
         const availSavBal = parseFloat(currentSavBal) - parseFloat(balance)
         if(availSavBal>0){
            await Current.updateOne({_id },
                { $set: { "balance" : newCurrBal}})

        //savings    
         await Savings.updateOne({owner: req.user._id},
             { $set: { "balance" : availSavBal}})
 
         const accountSav = await Savings.findOne({owner: req.user._id })
           res.status(200).send(accountSav)

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
        res.status(500).send("account doesn't exists,please check")
    } 
   
       
      } catch (e) {
          res.status(400).send(e)
      }
  })



app.post('/api/transfer-saving-to-saving',auth,async (req, res) => {
    const _id = req.body.id
    const balance = req.body.balance  
    const owner= JSON.stringify(req.user._id)

      try {
       //saving
       const transferAccount = await Savings.findById({_id })
       if(transferAccount){
        const ownerSend = JSON.stringify(transferAccount.owner)
        if(owner !== ownerSend){
         const currentBal = transferAccount.balance
         const newCurrBal = parseFloat(currentBal) + parseFloat(balance)
         const account = await Savings.findOne({owner: req.user._id}) 
         const currentSavBal = account.balance
         const availSavBal = parseFloat(currentSavBal) - parseFloat(balance)
         if(availSavBal>0){
            await Savings.updateOne({_id },
                { $set: { "balance" : newCurrBal}})

        //savings    
        
         await Savings.updateOne({owner: req.user._id},
             { $set: { "balance" : availSavBal}})
 
         const accountSav = await Savings.findOne({owner: req.user._id })
           res.status(200).send(accountSav)
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
        res.status(500).send("account doesn't exists,please check")
    } 
   
       
         
      } catch (e) {
          res.status(400).send(e)
      }
  })

 
  

app.get('/api/savings-balance',auth, async (req, res) => {
   
    try {
        const savings = await Savings.find({owner: req.user._id })

        if (!savings) {
           res.status(404).send("no savings account found")
        }
        res.status(200).send(savings)
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = app