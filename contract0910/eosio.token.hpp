/**
 *  @file
 *  @copyright defined in eos/LICENSE.txt
 */
#pragma once

#include <eosiolib/asset.hpp>
#include <eosiolib/eosio.hpp>

#include <string>

namespace eosiosystem {
   class system_contract;
}

namespace eosio {

   using std::string;

   class token : public contract {
      public:
         token( account_name self ):contract(self){}

         void create( account_name issuer,
                      asset        maximum_supply);

         void issue( account_name to, asset quantity, string memo );

         void transfer( account_name from,
                        account_name to,
                        asset        quantity,
                        string       memo );
         void transfer2( account_name from,
                        account_name to,
                        asset        quantity,
                        string       memo );
      
      //@abi action
         void lock(account_name user,
                   uint32_t timestamp);
            //@abi action
         void unlock(account_name user);
      //@abi action
         void hi(account_name user);
                   
      
      
         inline asset get_supply( symbol_name sym )const;
         
         inline asset get_balance( account_name owner, symbol_name sym )const;

      private:
// @abi table accounts i64
         struct account {
            asset    balance;

            uint64_t primary_key()const { return balance.symbol.name(); }
         };
// @abi table stat i64
         struct currency_stat {
            asset          supply;
            asset          max_supply;
            account_name   issuer;

            uint64_t primary_key()const { return supply.symbol.name(); }
         };
      
// @abi table lockup i64
        struct lockup_list {
           account_name user;
           uint64_t amount;
           uint32_t timestamp;
           
           uint64_t primary_key()const {return user;}
           EOSLIB_SERIALIZE(lockup_list,(user)(amount) (timestamp))
        };
      
// @abi table ttab i64
        struct ttab
        {
            account_name to;
            uint64_t primary_key() const {return to;}
            EOSLIB_SERIALIZE(ttab,(to))
        };
      
      
           
         typedef multi_index<N(ttab),ttab> _ttab;
         typedef eosio::multi_index<N(accounts), account> accounts;
         typedef eosio::multi_index<N(stat), currency_stat> stat;
         typedef eosio::multi_index<N(lockup_list), lockup_list> lockup;
      
      


         void sub_balance( account_name owner, asset value );
         void add_balance( account_name owner, asset value, account_name ram_payer );

      public:
         struct transfer_args {
            account_name  from;
            account_name  to;
            asset         quantity;
            string        memo;
         };
   };

   asset token::get_supply( symbol_name sym )const
   {
      stat statstable( _self, sym );
      const auto& st = statstable.get( sym );
      return st.supply;
   }

   asset token::get_balance( account_name owner, symbol_name sym )const
   {
      accounts accountstable( _self, owner );
      const auto& ac = accountstable.get( sym );
      return ac.balance;
   }

} /// namespace eosio
