import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CreateSmallVehicle1Dto,
  CreateSmallVehicle2Dto,
  CreateSpeed1Dto,
  CreateSpeed2Dto,
  CreateVehicle1Dto,
  CreateVehicle2Dto,
} from '../events.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSpeed1(data: CreateSpeed1Dto) {
    await this.prisma.speeds1.create({
      data,
    });
  }
  async createSpeed2(data: CreateSpeed2Dto) {
    await this.prisma.speeds2.create({
      data,
    });
  }
  async createVehicle1(data: CreateVehicle1Dto) {
    await this.prisma.vehicles1.create({
      data,
    });
  }
  async createVehicle2(data: CreateVehicle2Dto) {
    await this.prisma.vehicles2.create({
      data,
    });
  }

  async createSmallVehicle1(data: CreateSmallVehicle1Dto) {
    await this.prisma.smallvehicles1.create({ data });
  }

  async createSmallVehicle2(data: CreateSmallVehicle2Dto) {
    await this.prisma.smallvehicles2.create({ data });
  }
}
