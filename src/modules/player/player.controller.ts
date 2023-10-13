import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { PlayerService } from './player.service';
import { Response } from 'express';
import { Player } from './schema/player.schema';
import { CreatePlayerDTO } from './dto/create-player.dto';
import { SecurityService } from '../security/security.service';
import { ISocketAuth, UserRole } from 'src/types/user.types';
import { COOKIE, GET_PLAY_REQUEST, JWT_TTL, PLAY_TOKEN_COOKIE_NAME, Status } from 'src/utils/constant';
import { setCookie, handleResult } from 'src/utils/helper';
import { UpdatePlayerDTO } from './dto/update-player.dto';
import { Throttle } from '@nestjs/throttler';
import { Role, Active } from 'src/decorator/auth.decorator';
import { AuthorizationGuard } from 'src/guard/auth.guard';
import { AuthService } from '../shared/auth.service';

@Controller('player')
export class PlayerController {
  private readonly playerService: PlayerService;
  private readonly securityService: SecurityService;
  private readonly authService: AuthService;

  constructor(playerService: PlayerService, securityService: SecurityService, authService: AuthService) {
    this.playerService = playerService;
    this.securityService = securityService;
    this.authService = authService;
  }

  @Throttle(GET_PLAY_REQUEST.LIMIT, GET_PLAY_REQUEST.TTL)
  @Post()
  public async createPlayer(@Body() payload: CreatePlayerDTO, @Res({ passthrough: true }) response: Response): Promise<Player> {
    try {
      const { playId, nickName } = payload;
      const player = await this.playerService.createPlayer(playId, nickName);

      const playerData = player.getData();
      if (!playerData) throw new BadRequestException(player.getError());

      const playAccessToken = await this.securityService.generateTokens<ISocketAuth>(
        { id: playerData._id?.toHexString() ?? '', room: playId, role: UserRole.PLAYER },
        JWT_TTL.PLAYER_TOKEN_TTL,
      );

      const playAccessTokenData = playAccessToken.getData();
      if (!playAccessTokenData) throw new BadRequestException(playAccessToken.getError());

      setCookie(response, PLAY_TOKEN_COOKIE_NAME, playAccessTokenData, COOKIE.PLAY_ACCESS_TOKEN_COOKIE_TTL);

      return handleResult<Player>(player);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(GET_PLAY_REQUEST.LIMIT, GET_PLAY_REQUEST.TTL)
  @Role([UserRole.PLAYER])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @Get()
  public async getPlayer(): Promise<Player> {
    try {
      const playerId = this.authService.getId();
      const play = await this.playerService.getPlayerById(playerId);
      return handleResult<Player>(play);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(GET_PLAY_REQUEST.LIMIT, GET_PLAY_REQUEST.TTL)
  @Role([UserRole.PLAYER, UserRole.ORGANIZER])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @Get('/list')
  public async getPlayers(): Promise<Player[]> {
    try {
      const playId = this.authService.getRoom();
      const players = await this.playerService.getPlayers(playId);
      return handleResult<Player[]>(players);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(GET_PLAY_REQUEST.LIMIT, GET_PLAY_REQUEST.TTL)
  @Role([UserRole.PLAYER])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @Patch()
  public async updatePlayer(@Body() payload: UpdatePlayerDTO): Promise<Player> {
    try {
      const playId = this.authService.getRoom();
      const player = await this.playerService.updatePlayer(payload, playId);
      return handleResult<Player>(player);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(GET_PLAY_REQUEST.LIMIT, GET_PLAY_REQUEST.TTL)
  @Role([UserRole.ORGANIZER])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @Delete('/delete/:playerId')
  public async deletePlayer(@Param('playerId') playerId: string): Promise<Player> {
    try {
      const player = await this.playerService.deletePlayer(playerId);
      return handleResult<Player>(player);
    } catch (error) {
      throw error;
    }
  }
}
