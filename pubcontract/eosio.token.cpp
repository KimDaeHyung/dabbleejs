/**
 *  @file
 *  @copyright defined in eos/LICENSE.txt
 */

#include "eosio.token.hpp"

namespace eosio {

void token::check(account_name user, string memo){
	require_auth(_self);
	eosio_assert( is_account( user ), "user account does not exist");
}
	

void token::transfer(account_name from, bool internalfrom, account_name to, bool internalto, asset balance, string memo){
	require_auth(from);
	/*
	//internal to internal
	save(to, balance);
	draw(from, balance);
	//internal to external
	draw(from, balance);

       action(permission_level{ N(publytokenio), N(active) }, N(eosiotoken11), N(trasnfer),
				 std::make_tuple(to, balance)).send();
	

		 

	//external to internal
	save(to, balance);
        */
	//external to external case
	printf("for changes");
	
	action(permission_level{ _self, N(active) }, N(eoscafekorea), N(transfer),
				 std::make_tuple(_self, to, balance, "PUB transfer" )).send();
	
	printf("for contract evaluation");
	printf("for changes");

						     
}

void token::save(account_name user, asset quantity){

		printf("for contract evaluation");
	
	pubtbl pubtable(_self, _self);
	
	auto iter = pubtable.find(user);
	
	if(iter == pubtable.end()){
		pubtable.emplace(_self, [&]( auto& pubtable ) {
			pubtable.user = user;
			pubtable.balance = quantity;
			pubtable.is_internal = true;
			pubtable.ink = asset(0, eosio::symbol_type(eosio::string_to_symbol(4, "INK")));
;
		});
	}else{
		pubtable.modify(iter, _self, [&]( auto& pubtable ) {
			pubtable.balance += quantity;		
		});
	}
}
	
void token::draw(account_name user, asset quantity){

	pubtbl pubtable(_self, _self);
	
	auto iter = pubtable.find(user);
	
	if(iter == pubtable.end()){
		eosio_assert(iter != pubtable.end(), "draw account is not exist");
		printf("draw account is not exist");
	}else{
		pubtable.modify(iter, _self, [&]( auto& pubtable ) {
			pubtable.balance += quantity;
		});
	}
}

void token::stake(account_name from, account_name to, asset quantity){
	require_auth(from);
	staketbl staketbl(_self, _self);
	//need to implement delegate case
	auto iter = staketbl.find(to);
	
	if(iter == staketbl.end()){
		eosio_assert(iter != staketbl.end(), "stake account is not exist");
		printf("stake account is not exist");
	}else{
		staketbl.modify(iter, _self, [&]( auto& staketbl ) {
			staketbl.balance += quantity;
			staketbl.staked_at = now();
		});
	}
}

void token::unstake(account_name from, account_name to, asset quantity){
	require_auth(from);
	//need to implement delegate case
	unstaketbl unstaketbl(_self, _self);
	auto iter = unstaketbl.find(to);
	
	if(iter == unstaketbl.end()){
		eosio_assert(iter != unstaketbl.end(), "unstake account is not exist");
		printf("unstake accountis not exist");
	}else{
		unstaketbl.modify(iter, _self, [&]( auto& unstaketbl ) {
			unstaketbl.balance.amount -= quantity.amount;
			unstaketbl.unstaked_at = now();
		});
	}
}

void token::update(account_name from){
	require_auth(from);
}
  
  

	



}

EOSIO_ABI( eosio::token, (check)(transfer)(stake)(unstake)(update) )
	

