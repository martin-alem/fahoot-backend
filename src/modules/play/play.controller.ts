import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { CreatePlayDTO } from './dto/create-play.dto';
import { AuthService } from '../shared/auth.service';
import { PlayService } from './play.service';
import { SecurityService } from '../security/security.service';
import { ISocketAuth, UserRole } from 'src/types/user.types';
import { COOKIE, CREATE_PLAY_REQUEST, GET_PLAY_REQUEST, JWT_TTL, PLAY_TOKEN_COOKIE_NAME, Status } from 'src/utils/constant';
import { clearCookie, extractIds, handleResult, setCookie } from 'src/utils/helper';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { Role, Active } from 'src/decorator/auth.decorator';
import { AuthorizationGuard } from 'src/guard/auth.guard';
import { Play } from './schema/play.schema';
import { IPaginationResult } from 'src/types/pagination_result.type';
import { PlayPaginationDTO } from './dto/play-pagination.dto';
import { UpdatePlayDTO } from './dto/update-play.dto';

@Controller('play')
export class PlayController {
  private readonly playService: PlayService;
  private readonly authService: AuthService;
  private readonly securityService: SecurityService;

  constructor(playService: PlayService, authService: AuthService, securityService: SecurityService) {
    this.playService = playService;
    this.authService = authService;
    this.securityService = securityService;
  }

  @Throttle(CREATE_PLAY_REQUEST.LIMIT, CREATE_PLAY_REQUEST.TTL)
  @Role([UserRole.CREATOR])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @Post()
  public async createPlay(@Body() payload: CreatePlayDTO, @Res({ passthrough: true }) response: Response): Promise<Play> {
    try {
      const userId = this.authService.getId();
      const play = await this.playService.createPlay(payload.quizId, userId);

      const playData = play.getData();
      if (!playData) throw new BadRequestException(play.getError());

      const playAccessToken = await this.securityService.generateTokens<ISocketAuth>(
        { id: userId, room: playData._id?.toHexString() ?? '', role: UserRole.ORGANIZER },
        JWT_TTL.PLAYER_TOKEN_TTL,
      );

      const playAccessTokenData = playAccessToken.getData();
      if (!playAccessTokenData) throw new BadRequestException(playAccessToken.getError());

      setCookie(response, PLAY_TOKEN_COOKIE_NAME, playAccessTokenData, COOKIE.PLAY_ACCESS_TOKEN_COOKIE_TTL);

      return handleResult<Play>(play);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(GET_PLAY_REQUEST.LIMIT, GET_PLAY_REQUEST.TTL)
  @Role([UserRole.CREATOR])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @Get('/id/:playId')
  public async getPlay(@Param('playId') playId: string): Promise<Play> {
    try {
      const play = await this.playService.getPlayById(playId);
      return handleResult<Play>(play);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(GET_PLAY_REQUEST.LIMIT, GET_PLAY_REQUEST.TTL)
  @Role([UserRole.CREATOR])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @Get('/list/:quizId')
  public async getPlayList(@Param('quizId') quizId: string, @Query() pagination: PlayPaginationDTO): Promise<IPaginationResult<Play>> {
    try {
      const plays = await this.playService.getPlayList(quizId, pagination);
      return handleResult<IPaginationResult<Play>>(plays);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(GET_PLAY_REQUEST.LIMIT, GET_PLAY_REQUEST.TTL)
  @Role([UserRole.CREATOR])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @Patch('/:playId')
  public async updatePlay(@Body() payload: UpdatePlayDTO, @Param('playId') playId: string): Promise<Play> {
    try {
      const play = await this.playService.updatePlay(payload, playId);
      return handleResult<Play>(play);
    } catch (error) {
      throw error;
    }
  }

  @Delete('/exit_game')
  public clearPlayCookie(@Res({ passthrough: true }) response: Response): void {
    clearCookie(response, {}, PLAY_TOKEN_COOKIE_NAME);
  }

  @Throttle(GET_PLAY_REQUEST.LIMIT, GET_PLAY_REQUEST.TTL)
  @Role([UserRole.CREATOR])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @Delete('/:playId')
  public async deletePlay(@Param('playId') playId: string): Promise<boolean> {
    try {
      const play = await this.playService.deletePlay(playId);
      return handleResult<boolean>(play);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(GET_PLAY_REQUEST.LIMIT, GET_PLAY_REQUEST.TTL)
  @Role([UserRole.CREATOR])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @Delete('/batch/:quizId')
  public async deletePlayList(@Param('quizId') quizId: string, @Query('playIds') playIds: string): Promise<boolean> {
    try {
      const playIdsArray = extractIds(playIds);
      const play = await this.playService.deletePlayList(quizId, playIdsArray);
      return handleResult<boolean>(play);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(GET_PLAY_REQUEST.LIMIT, GET_PLAY_REQUEST.TTL)
  @Role([UserRole.ORGANIZER, UserRole.PLAYER])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @Get()
  public async getPlayById(): Promise<Play> {
    try {
      const playId = this.authService.getRoom();
      const play = await this.playService.getPlayById(playId);
      return handleResult<Play>(play);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(GET_PLAY_REQUEST.LIMIT, GET_PLAY_REQUEST.TTL)
  @Get('/pin/:pin')
  public async getPlayByPin(@Param('pin') playPin: string): Promise<Play> {
    try {
      const play = await this.playService.getPlayByPin(playPin);
      return handleResult<Play>(play);
    } catch (error) {
      throw error;
    }
  }
}
