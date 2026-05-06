use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, CloseAccount, Mint, Token, TokenAccount, Transfer},
};

declare_id!("HMUA8HamCjknhpbFzeVCQPELDX3edDbTcscvZjmrgBmq");

pub const CONFIG_SPACE: usize = 8 + 32 + 1;
pub const ESCROW_SPACE: usize = 8 + 32 + 32 + 32 + 8 + 8 + 1;

pub const CONFIG_SEED: &[u8] = b"config";
pub const ESCROW_SEED: &[u8] = b"escrow";
pub const VAULT_SEED: &[u8] = b"vault";

#[account]
pub struct ConfigAccount {
    pub platform_authority: Pubkey,
    pub bump: u8,
}

#[account]
pub struct EscrowAccount {
    pub client: Pubkey,
    pub trainer: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
    pub booking_id: u64,
    pub bump: u8,
}

#[event]
pub struct BookingInitialized {
    pub booking_id: u64,
    pub client_wallet: Pubkey,
    pub trainer_wallet: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
}

#[event]
pub struct FundsReleased {
    pub booking_id: u64,
    pub trainer_wallet: Pubkey,
    pub amount: u64,
}

#[event]
pub struct FundsRefunded {
    pub booking_id: u64,
    pub client_wallet: Pubkey,
    pub amount: u64,
}

#[program]
pub mod relive_escrow {
    use super::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.platform_authority = ctx.accounts.platform_authority.key();
        config.bump = ctx.bumps.config;
        Ok(())
    }

    pub fn initialize_booking(
        ctx: Context<InitializeBooking>,
        booking_id: u64,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, EscrowError::ZeroAmount);

        let escrow = &mut ctx.accounts.escrow;
        escrow.client = ctx.accounts.client.key();
        escrow.trainer = ctx.accounts.trainer.key();
        escrow.mint = ctx.accounts.mint.key();
        escrow.amount = amount;
        escrow.booking_id = booking_id;
        escrow.bump = ctx.bumps.escrow;

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.client_token_account.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.client.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, amount)?;

        emit!(BookingInitialized {
            booking_id,
            client_wallet: ctx.accounts.client.key(),
            trainer_wallet: ctx.accounts.trainer.key(),
            mint: ctx.accounts.mint.key(),
            amount,
        });

        msg!(
            "BookingInitialized:{{\"bookingId\":{},\"clientWallet\":\"{}\",\"trainerWallet\":\"{}\",\"mint\":\"{}\",\"amount\":\"{}\",\"escrowAddress\":\"{}\"}}",
            booking_id,
            ctx.accounts.client.key(),
            ctx.accounts.trainer.key(),
            ctx.accounts.mint.key(),
            amount,
            ctx.accounts.escrow.key()
        );

        Ok(())
    }

    pub fn release_funds(ctx: Context<ReleaseFunds>) -> Result<()> {
        let escrow = &ctx.accounts.escrow;
        let amount = escrow.amount;
        let booking_id = escrow.booking_id;

        require!(
            ctx.accounts.platform_authority.key() == ctx.accounts.config.platform_authority,
            EscrowError::InvalidPlatformAuthority
        );
        require!(
            ctx.accounts.trainer.key() == escrow.trainer,
            EscrowError::UnauthorizedTrainer
        );
        require!(
            ctx.accounts.client.key() == escrow.client,
            EscrowError::InvalidRentRecipient
        );

        let escrow_key = ctx.accounts.escrow.key();
        let vault_seeds: &[&[u8]] = &[VAULT_SEED, escrow_key.as_ref(), &[ctx.bumps.vault]];
        let signer_seeds = &[vault_seeds];

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.trainer_token_account.to_account_info(),
                authority: ctx.accounts.vault.to_account_info(),
            },
            signer_seeds,
        );
        token::transfer(transfer_ctx, amount)?;

        let close_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            CloseAccount {
                account: ctx.accounts.vault.to_account_info(),
                destination: ctx.accounts.client.to_account_info(),
                authority: ctx.accounts.vault.to_account_info(),
            },
            signer_seeds,
        );
        token::close_account(close_ctx)?;

        emit!(FundsReleased {
            booking_id,
            trainer_wallet: ctx.accounts.trainer.key(),
            amount,
        });

        Ok(())
    }

    pub fn refund_booking(ctx: Context<RefundBooking>) -> Result<()> {
        let escrow = &ctx.accounts.escrow;
        let amount = escrow.amount;
        let booking_id = escrow.booking_id;

        require!(
            ctx.accounts.platform_authority.key() == ctx.accounts.config.platform_authority,
            EscrowError::InvalidPlatformAuthority
        );
        require!(
            ctx.accounts.client.key() == escrow.client,
            EscrowError::UnauthorizedClient
        );

        let escrow_key = ctx.accounts.escrow.key();
        let vault_seeds: &[&[u8]] = &[VAULT_SEED, escrow_key.as_ref(), &[ctx.bumps.vault]];
        let signer_seeds = &[vault_seeds];

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.client_token_account.to_account_info(),
                authority: ctx.accounts.vault.to_account_info(),
            },
            signer_seeds,
        );
        token::transfer(transfer_ctx, amount)?;

        let close_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            CloseAccount {
                account: ctx.accounts.vault.to_account_info(),
                destination: ctx.accounts.client.to_account_info(),
                authority: ctx.accounts.vault.to_account_info(),
            },
            signer_seeds,
        );
        token::close_account(close_ctx)?;

        emit!(FundsRefunded {
            booking_id,
            client_wallet: ctx.accounts.client.key(),
            amount,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub platform_authority: Signer<'info>,

    #[account(
        init,
        payer = platform_authority,
        space = CONFIG_SPACE,
        seeds = [CONFIG_SEED],
        bump
    )]
    pub config: Account<'info, ConfigAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(booking_id: u64, amount: u64)]
pub struct InitializeBooking<'info> {
    #[account(mut)]
    pub client: Signer<'info>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, ConfigAccount>,

    /// CHECK: This wallet is stored in escrow and later enforced on release.
    pub trainer: UncheckedAccount<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = client,
        space = ESCROW_SPACE,
        seeds = [ESCROW_SEED, booking_id.to_le_bytes().as_ref()],
        bump
    )]
    pub escrow: Account<'info, EscrowAccount>,

    #[account(
        init,
        payer = client,
        token::mint = mint,
        token::authority = vault,
        seeds = [VAULT_SEED, escrow.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = client
    )]
    pub client_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ReleaseFunds<'info> {
    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, ConfigAccount>,

    pub platform_authority: Signer<'info>,

    #[account(mut)]
    pub trainer: Signer<'info>,

    /// CHECK: The address is checked against escrow.client and receives rent.
    #[account(mut)]
    pub client: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [ESCROW_SEED, escrow.booking_id.to_le_bytes().as_ref()],
        bump = escrow.bump,
        has_one = mint,
        close = client
    )]
    pub escrow: Account<'info, EscrowAccount>,

    #[account(
        mut,
        seeds = [VAULT_SEED, escrow.key().as_ref()],
        bump,
        token::mint = mint,
        token::authority = vault
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = trainer
    )]
    pub trainer_token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct RefundBooking<'info> {
    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, ConfigAccount>,

    pub platform_authority: Signer<'info>,

    #[account(mut)]
    pub client: Signer<'info>,

    #[account(
        mut,
        seeds = [ESCROW_SEED, escrow.booking_id.to_le_bytes().as_ref()],
        bump = escrow.bump,
        has_one = mint,
        close = client
    )]
    pub escrow: Account<'info, EscrowAccount>,

    #[account(
        mut,
        seeds = [VAULT_SEED, escrow.key().as_ref()],
        bump,
        token::mint = mint,
        token::authority = vault
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = client
    )]
    pub client_token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[error_code]
pub enum EscrowError {
    #[msg("Deposit amount must be greater than zero")]
    ZeroAmount,
    #[msg("Unauthorized: caller is not the trainer for this escrow")]
    UnauthorizedTrainer,
    #[msg("Unauthorized: caller is not the client for this escrow")]
    UnauthorizedClient,
    #[msg("Invalid platform authority")]
    InvalidPlatformAuthority,
    #[msg("Invalid rent recipient")]
    InvalidRentRecipient,
}
