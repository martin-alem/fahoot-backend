import { HttpStatus, Injectable } from '@nestjs/common';
import Result from 'src/wrapper/result';
import { Player } from './schema/player.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PlayService } from '../play/play.service';
import { DEFAULT_DATABASE_CONNECTION, ErrorMessages, Status } from 'src/utils/constant';
import { log, validateObjectId } from 'src/utils/helper';
import { UpdatePlayerDTO } from './dto/update-player.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class PlayerService {
  private readonly playerModel: Model<Player>;
  private readonly playService: PlayService;
  private readonly loggerService: LoggerService;

  constructor(
    @InjectModel(Player.name, DEFAULT_DATABASE_CONNECTION) playerModel: Model<Player>,
    playService: PlayService,
    loggerService: LoggerService,
  ) {
    this.playerModel = playerModel;
    this.playService = playService;
    this.loggerService = loggerService;
  }

  public async createPlayer(playId: string, playerNickName: string): Promise<Result<Player | null>> {
    try {
      const play = await this.playService.getPlayById(playId);

      const playData = play.getData();

      if (!playData) return new Result<null>(false, null, play.getError(), HttpStatus.BAD_REQUEST);

      if (!playData.isOpen) return new Result<null>(false, null, 'Game locked. Ask the organizer to unlock the game.', HttpStatus.BAD_REQUEST);

      const playExist = await this.playerModel.findOne({ play: playId, nickName: playerNickName.toLowerCase() });

      if (playExist) return new Result<null>(false, null, 'Sorry! that nickname is already in use.', HttpStatus.BAD_REQUEST);

      const player = await this.playerModel.create({ play: playId, nickName: playerNickName, status: Status.ACTIVE });

      if (!player) return new Result<null>(false, null, 'You are unable to join the game at this moment.', HttpStatus.BAD_REQUEST);

      return new Result<Player>(true, player, null, HttpStatus.OK);
    } catch (error) {
      console.log(error);
      log(this.loggerService, 'create_player_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async getPlayerById(playerId: string): Promise<Result<Player | null>> {
    try {
      const validPlayerObjectId = validateObjectId(playerId);

      if (!validPlayerObjectId.getData()) return new Result<null>(false, null, 'Invalid player Id', HttpStatus.BAD_REQUEST);

      const player = await this.playerModel.findById(playerId);

      if (!player) return new Result<null>(false, null, 'Player not found', HttpStatus.BAD_REQUEST);

      return new Result<Player>(true, player, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'get_player_by_id_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async getPlayers(playId: string): Promise<Result<Player[] | null>> {
    try {
      const validPlayIdObjectId = validateObjectId(playId);

      if (!validPlayIdObjectId.getData()) return new Result<null>(false, null, 'Invalid play id', HttpStatus.BAD_REQUEST);

      const results = await this.playerModel.find({ play: playId }).sort({ createdAt: -1 });

      return new Result<Player[]>(true, results, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'get_players_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async updatePlayer(payload: UpdatePlayerDTO, playerId: string): Promise<Result<Player | null>> {
    try {
      const { nickName } = payload;

      const validPlayerObjectId = validateObjectId(playerId);

      if (!validPlayerObjectId.getData()) return new Result<null>(false, null, 'Invalid player id', HttpStatus.BAD_REQUEST);

      const updatedPlayer = await this.playerModel.findOneAndUpdate({ _id: playerId }, { nickName: nickName }, { new: true });

      if (!updatedPlayer) return new Result<null>(false, null, 'Unable to update player', HttpStatus.BAD_REQUEST);

      return new Result<Player>(true, updatedPlayer, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'update_player_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async deletePlayer(playerId: string): Promise<Result<Player | null>> {
    try {
      const validPlayerObjectId = validateObjectId(playerId);

      if (!validPlayerObjectId.getData()) return new Result<null>(false, null, 'Invalid player id', HttpStatus.BAD_REQUEST);

      const deletedPlayer = await this.playerModel.findOneAndDelete({ _id: playerId });

      if (!deletedPlayer) return new Result<null>(false, null, 'Unable to delete player', HttpStatus.BAD_REQUEST);

      return new Result<Player>(true, null, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'delete_player_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
