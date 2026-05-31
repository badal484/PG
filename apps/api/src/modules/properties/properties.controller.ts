import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  CreateFloorDto,
  CreateRoomDto,
  CreateBedDto,
  UpdateBedDto,
  SearchPropertiesDto,
  AddPhotoDto,
} from './dto/property.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole, PropertyTier } from '@roomly/database';

@ApiTags('Properties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  // ─── Public Marketplace ────────────────────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search & filter listed properties (marketplace)' })
  findAll(@Query() query: SearchPropertiesDto) {
    return this.propertiesService.findAll(query);
  }

  @Get('my')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Get current owner's properties" })
  getMine(@CurrentUser('id') ownerId: string) {
    return this.propertiesService.findOwnerProperties(ownerId);
  }

  @Public()
  @Get('city/:city')
  @ApiOperation({ summary: 'Get properties in a city' })
  findByCity(@Param('city') city: string, @Query() query: SearchPropertiesDto) {
    return this.propertiesService.findAll({ ...query, city });
  }

  @Public()
  @Get('locality/:locality/:city')
  @ApiOperation({ summary: 'Get properties in a locality' })
  findByLocality(@Param('city') city: string, @Query() query: SearchPropertiesDto) {
    return this.propertiesService.findAll({ ...query, city });
  }

  @Public()
  @Get(':slug/beds')
  @ApiOperation({ summary: 'Get available beds for a property' })
  getBeds(@Param('slug') slug: string, @Query() query: any) {
    return this.propertiesService.findAvailableBeds(slug, query);
  }

  @Get(':propertyId/bookings')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get property bookings' })
  getPropertyBookings(@Param('propertyId') propertyId: string) {
    return this.propertiesService.findBookings(propertyId);
  }

  @Public()
  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get property detail by ID or slug' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.propertiesService.findOne(idOrSlug);
  }

  // ─── Owner Management ─────────────────────────────────────────────────────────

  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new property listing' })
  create(@CurrentUser('id') ownerId: string, @Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(ownerId, dto);
  }

  @Get('owner/my-properties')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all properties owned by current user' })
  getMyProperties(@CurrentUser('id') ownerId: string) {
    return this.propertiesService.findOwnerProperties(ownerId);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update property details' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') ownerId: string,
    @Body() dto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, ownerId, dto);
  }

  @Patch(':id/toggle-listing')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Toggle property listing on/off' })
  toggleListing(@Param('id') id: string, @CurrentUser('id') ownerId: string) {
    return this.propertiesService.toggleListing(id, ownerId);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Soft-delete a property' })
  delete(@Param('id') id: string, @CurrentUser('id') ownerId: string) {
    return this.propertiesService.delete(id, ownerId);
  }

  // ─── Floors ────────────────────────────────────────────────────────────────────

  @Post(':propertyId/floors')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Add a floor to a property' })
  createFloor(
    @Param('propertyId') propertyId: string,
    @CurrentUser('id') ownerId: string,
    @Body() dto: CreateFloorDto,
  ) {
    return this.propertiesService.createFloor(propertyId, ownerId, dto);
  }

  @Delete(':propertyId/floors/:floorId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a floor' })
  deleteFloor(
    @Param('propertyId') propertyId: string,
    @Param('floorId') floorId: string,
    @CurrentUser('id') ownerId: string,
  ) {
    return this.propertiesService.deleteFloor(propertyId, floorId, ownerId);
  }

  // ─── Rooms ─────────────────────────────────────────────────────────────────────

  @Post(':propertyId/floors/:floorId/rooms')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Add a room to a floor' })
  createRoom(
    @Param('propertyId') propertyId: string,
    @Param('floorId') floorId: string,
    @CurrentUser('id') ownerId: string,
    @Body() dto: CreateRoomDto,
  ) {
    return this.propertiesService.createRoom(propertyId, floorId, ownerId, dto);
  }

  @Delete(':propertyId/rooms/:roomId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a room' })
  deleteRoom(
    @Param('propertyId') propertyId: string,
    @Param('roomId') roomId: string,
    @CurrentUser('id') ownerId: string,
  ) {
    return this.propertiesService.deleteRoom(propertyId, roomId, ownerId);
  }

  // ─── Beds ──────────────────────────────────────────────────────────────────────

  @Post(':propertyId/rooms/:roomId/beds')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Add a bed to a room' })
  createBed(
    @Param('propertyId') propertyId: string,
    @Param('roomId') roomId: string,
    @CurrentUser('id') ownerId: string,
    @Body() dto: CreateBedDto,
  ) {
    return this.propertiesService.createBed(propertyId, roomId, ownerId, dto);
  }

  @Patch(':propertyId/beds/:bedId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update bed details or status' })
  updateBed(
    @Param('propertyId') propertyId: string,
    @Param('bedId') bedId: string,
    @CurrentUser('id') ownerId: string,
    @Body() dto: UpdateBedDto,
  ) {
    return this.propertiesService.updateBed(propertyId, bedId, ownerId, dto);
  }

  @Delete(':propertyId/beds/:bedId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a bed' })
  deleteBed(
    @Param('propertyId') propertyId: string,
    @Param('bedId') bedId: string,
    @CurrentUser('id') ownerId: string,
  ) {
    return this.propertiesService.deleteBed(propertyId, bedId, ownerId);
  }

  // ─── Photos ────────────────────────────────────────────────────────────────────

  @Post(':propertyId/photos')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Add a photo to property' })
  addPhoto(
    @Param('propertyId') propertyId: string,
    @CurrentUser('id') ownerId: string,
    @Body() dto: AddPhotoDto,
  ) {
    return this.propertiesService.addPhoto(propertyId, ownerId, dto);
  }

  @Delete(':propertyId/photos/:photoId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a property photo' })
  deletePhoto(
    @Param('propertyId') propertyId: string,
    @Param('photoId') photoId: string,
    @CurrentUser('id') ownerId: string,
  ) {
    return this.propertiesService.deletePhoto(propertyId, photoId, ownerId);
  }

  // ─── Admin Verification ────────────────────────────────────────────────────────

  @Get('admin/pending-verifications')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Get properties pending verification' })
  getPendingVerifications() {
    return this.propertiesService.getPendingVerifications();
  }

  @Patch(':id/admin/verify')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Verify and tier a property' })
  verifyProperty(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body('tier') tier: PropertyTier,
  ) {
    return this.propertiesService.verifyProperty(id, adminId, tier);
  }

  @Patch(':id/admin/reject')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Reject a property' })
  rejectProperty(@Param('id') id: string, @Body('reason') reason: string) {
    return this.propertiesService.rejectProperty(id, reason);
  }
}
