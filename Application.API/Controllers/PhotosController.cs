using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.API.Data;
using Application.API.Dtos;
using Application.API.Helpers;
using Application.API.Models;
using AutoMapper;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Application.API.Controllers {
    [Route ("api/users/photos")]
    [ApiController]
    public class PhotosController : ControllerBase {
        private readonly IGeneralRepository _repo;
        private readonly IMapper _mapper;
        private readonly IOptions<CloudinarySettings> _cloudinaryConfig;
        private Cloudinary _cloudinary;

        public PhotosController (IGeneralRepository repo, IMapper mapper, IOptions<CloudinarySettings> cloudinaryConfig) {
            _cloudinaryConfig = cloudinaryConfig;
            _mapper = mapper;
            _repo = repo;

            Account acc = new Account (
                _cloudinaryConfig.Value.CloudName,
                _cloudinaryConfig.Value.ApiKey,
                _cloudinaryConfig.Value.ApiSecret
            );
            _cloudinary = new Cloudinary (acc);
        }

        [HttpGet ("{id}", Name = "GetPhoto")]
        public async Task<IActionResult> GetPhoto (int id) {
            var photoFromRepo = await _repo.GetPhoto (id);
            var photo = _mapper.Map<PhotoForReturnDto> (photoFromRepo);
            return Ok (photo);
        }

        [HttpPost]
        public async Task<IActionResult> AddPhotoForUser ([FromForm] PhotoForCreationDto photoForCreationDto) {
            var userId = int.Parse (User.FindFirst (ClaimTypes.NameIdentifier).Value);
            var userFromRepo = await _repo.GetUser (userId);
            var file = photoForCreationDto.File;
            var uploadResult = new ImageUploadResult ();
            if (file.Length > 0) {
                using (var stream = file.OpenReadStream ()) {
                    var uploadParams = new ImageUploadParams () {
                    File = new FileDescription (file.Name, stream),
                    Transformation = new Transformation ().Width (500).Height (500).Crop ("fill").Gravity ("face")
                    };
                    uploadResult = _cloudinary.Upload (uploadParams);
                }
            }
            photoForCreationDto.Url = uploadResult.Uri.ToString ();
            photoForCreationDto.PublicId = uploadResult.PublicId;
            var photo = _mapper.Map<Photo> (photoForCreationDto);
            if (!userFromRepo.Photos.Any (u => u.IsMain)) {
                photo.IsMain = true;
            }
            userFromRepo.Photos.Add (photo);

            if (await _repo.SaveAll ()) {
                var photoToReturn = _mapper.Map<PhotoForReturnDto> (photo);
                return CreatedAtRoute ("GetPhoto", new { id = photo.Id }, photoToReturn);
            }
            return BadRequest ("Could not add the photo");
        }

        [HttpPost ("{id}/setMain")]
        public async Task<IActionResult> SetMainPhoto (int id) {
            var userId = int.Parse (User.FindFirst (ClaimTypes.NameIdentifier).Value);
            var userFromRepo = await _repo.GetUser (userId);
            if (!userFromRepo.Photos.Any (p => p.Id == id)) {
                return Unauthorized ();
            }
            var photoFromRepo = await _repo.GetPhoto (id);
            if (photoFromRepo.IsMain) {
                return BadRequest ("this is the main photo");
            }
            var currentMainPhoto = await _repo.GetMainPhoto (userId);
            currentMainPhoto.IsMain = false;
            photoFromRepo.IsMain = true;
            if (await _repo.SaveAll ()) {
                return NoContent ();
            }
            return BadRequest ("could not set main photo");
        }

        [HttpDelete ("{id}")]
        public async Task<IActionResult> DeletePhoto (int id) {
            var userId = int.Parse (User.FindFirst (ClaimTypes.NameIdentifier).Value);
            var userFromRepo = await _repo.GetUser (userId);
            if (!userFromRepo.Photos.Any (p => p.Id == id)) {
                return Unauthorized ();
            }
            var photoFromRepo = await _repo.GetPhoto (id);
            if (photoFromRepo.IsMain) {
                return BadRequest ("you cannot delete the main photo");
            }
            // optionally to remove seed images
            if (photoFromRepo.PublicID != null) {
                var deleteParamas = new DeletionParams (photoFromRepo.PublicID);
                var result = _cloudinary.Destroy (deleteParamas);
                if (result.Result == "ok") {
                    _repo.Delete (photoFromRepo);
                }
            }
            if (photoFromRepo.PublicID == null) {
                _repo.Delete (photoFromRepo);
            }

            if (await _repo.SaveAll ()) {
                return Ok ();
            }
            return BadRequest ("could not delete photo");
        }
    }
}