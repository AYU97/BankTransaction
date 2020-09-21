const express = require('express')
const app = express();
const Savings = require('../models/Savings')
const BasicSavings = require('../models/BasicSavings')
const Current = require('../models/Current')
const auth = require('../middleware/auth')

app.post('/api/create-current-acc',auth,async (req, res) => {
    const current = new Current({
        type:'Current Account',  
        balance:0,
        owner:req.user._id
    })

    try {
       const account = await Current.findOne({owner: req.user._id })
        if(!account){
                await current.save()
                res.status(201).send(current)
        }
        else{
            res.status(500).send("current account already exists")
        }
    } catch (e) {
        res.status(400).send(e)
    }
})


app.post('/api/add-money-currentown',auth,async (req, res) => {
try {
     const account = await Current.findOne({owner:req.user._id})
     if(account){
        const currentBal = account.balance
        const newCurrBal = parseFloat(currentBal) + parseFloat(req.body.balance)
            await Current.updateOne({owner: req.user._id },
                { $set: { "balance" : newCurrBal}})
            const accountNew = await Current.findOne({owner: req.user._id })
                res.status(201).send(accountNew)
        }     
      else{
          res.status(500).send("current account doesn't exists")
      } 
     
  } catch (e) {
      res.status(400).send(e)
  }
})


app.post('/api/transfer-current-to-basic',auth,async (req, res) => {
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
         const account = await Current.findOne({owner: req.user._id}) 
         const currentBal = account.balance
         const availCurrBal = parseFloat(currentBal) - parseFloat(balance)
         if(availCurrBal>0){
            if(newBasicBal > 50000){
                res.status(400).send("basic savings account limit of 50,000 exceeded")
            }
            else{
                await BasicSavings.updateOne({_id },
                    { $set: { "balance" : newBasicBal}})
    
            //current    
           
             await Current.updateOne({owner: req.user._id},
                 { $set: { "balance" : availCurrBal}})
     
             const accountSav = await Current.findOne({owner: req.user._id })
               res.status(200).send(accountSav)
             }
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
        res.status(500).send(" account doesn't exists, please check")
    } 
        
      } catch (e) {
          res.status(400).send(e)
      }
  })


  app.post('/api/transfer-current-to-savings',auth,async (req, res) => {
    const _id = req.body.id
    const balance = req.body.balance  
    const owner= JSON.stringify(req.user._id)
      try {
       //savings
       const transferAccount = await Savings.findById({_id })
       if(transferAccount){
        const ownerSend = JSON.stringify(transferAccount.owner)
        if(owner !== ownerSend){
         const currentSavBal = transferAccount.balance
         const newSavBal = parseFloat(currentSavBal) + parseFloat(balance)
         const account = await Current.findOne({owner: req.user._id}) 
         const currentBal = account.balance
         const availCurrBal = parseFloat(currentBal) - parseFloat(balance)
         if(availCurrBal>0){
            await Savings.updateOne({_id },
                { $set: { "balance" : newSavBal}})

        //current    
        
         await Current.updateOne({owner: req.user._id},
             { $set: { "balance" : availCurrBal}})
 
         const accountSav = await Current.findOne({owner: req.user._id })
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
        res.status(500).send("account doesn't exists, please check")
    } 

      
      } catch (e) {
          res.status(400).send(e)
      }
  })



  app.post('/api/transfer-current-to-current',auth,async (req, res) => {
    const _id = req.body.id
    const balance = req.body.balance  
    const owner= JSON.stringify(req.user._id)
      try {
       //current
       const transferAccount = await Current.findById({_id })
       if(transferAccount){
      const ownerSend = JSON.stringify(transferAccount.owner)
       if(owner !== ownerSend){
        const currentSavBal = transferAccount.balance
        const newSavBal = parseFloat(currentSavBal) + parseFloat(balance)
        const account = await Current.findOne({owner: req.user._id}) 
         const currentBal = account.balance
         const availCurrBal = parseFloat(currentBal) - parseFloat(balance)
        if(availCurrBal>0){
            await Current.updateOne({_id },
                { $set: { "balance" : newSavBal}})

        //current    
         
         await Current.updateOne({owner: req.user._id},
             { $set: { "balance" : availCurrBal}})
 
         const accountSav = await Current.findOne({owner: req.user._id })
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
        res.status(500).send("account doesn't exists, please check")
    } 

       
      } catch (e) {
          res.status(400).send(e)
      }
})




app.get('/api/current-balance',auth, async (req, res) => {
   
    try {
        const current = await Current.find({owner: req.user._id })

        if (!current) {
           res.status(404).send("no current account found")
        }
        res.status(200).send(current)
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = app