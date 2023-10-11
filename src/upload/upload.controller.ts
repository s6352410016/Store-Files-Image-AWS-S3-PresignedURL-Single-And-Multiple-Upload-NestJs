import { Controller, Post, Get, UseInterceptors, UploadedFiles, HttpCode, HttpStatus, Param, Res, Delete } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Response } from 'express';

@Controller()
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    @Post("upload")
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FilesInterceptor("image", 10, {
        fileFilter: (req, file, cb) => {
            if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" || file.mimetype === "image/webp") {
                return cb(null, true);
            }
            cb(new Error("File extensions is not valid."), false);
        }
    }))
    upload(@UploadedFiles() files: Array<Express.Multer.File>): Promise<{ filePath: string[] }> {
        return this.uploadService.upload(files);
    }

    @Get("image/:key")
    getImage(@Param("key") key: string, @Res() res: Response) {
        return this.uploadService.getImage(key, res);
    }

    @Delete("image/:key")
    deleteImage(@Param("key") key: string): Promise<{msg: string}> {
        return this.uploadService.deleteImage(key);
    }
}
