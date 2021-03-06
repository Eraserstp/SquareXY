/**********

SquareXY

author: Andrey 'Eraser' Stepanov
mailto: eraserstp@gmail.com

Forked from:

Smartcore : L'empileuse

author: serge.vi / smartfriendz
licence : GPL

***********/

// global vars - updated from interface but need to be avalaible in all functions
var _globalResolution; // used to speed up rendering. ugly for preview . use 24 or 32 for generating stl.
var _globalWidth; // exernal dimension of the all printer
var _globalHeight; // exernal dimension of the all printer
var _globalDepth; // exernal dimension of the all printer
var _printableWidth;
var _printableDepth;
var _printableHeight;
var _offsetFront;
var _offsetSide;
var _offsetStand;
var _wallThickness; // box wood thickness
var _XYrodsDiam; // usually 6 or 8 .. or 10? 
var _XYlmDiam; // lm6uu, lm8uu ... will be calculated from rods diam
var _XYlmLength;
var _ZrodsDiam; // usually 6, 8, 10 or 12 
var _ZlmDiam; // lm6uu, lm8uu ... will be calculated from rods diam
var _ZlmLength;
var _nemaXYZ;  // nema 14 , nema 17 
var _XrodsWidth = 60; //space between rods on X axis
var _ZrodsWidth = 60; //space between rods on Z axis
var XrodLength = 300; // will be calculated in main from parameters.
var YrodLength = 300; // will be calculated in main from parameters.
var ZrodLength = 300; // will be calculated in main from parameters.
var _rodsSupportThickness = 3; // thickness around rods for all supports
var outputPlateWidth = 180; //used when output to printable plates for elements
var outputPlateDepth = 180;
var mk7Diam = 10;
var beltXAddon = 120; // belt extra length over rod size - bearing guides and difference between bearing edge to end of rod
var beltYAddon = 30; // belt extra length over y rod size - distance from motor pulley edge to Y rod mount and

var boxType = 1; // 0=wood standard , 1=extrusion frame ,2=closed box ,3=mini?
var _extrusionSize = 15;

var thickness = 3; //printed wall thickness
var armlen = 60; //printed cotner lenght

// global for work
var headoffset = -90; // used to place the head along X axis
var XaxisOffset = -40; // used to palce the X axis on Y
var _ZaxisOffset = -30; // used to place Z stage.
var endxJheadAttachHolesWidth = 32; // tempo.. 

var output; // show hide objects  from output choosen in the parameters.


// interactive parameters

function getParameterDefinitions() {
  return [
  { name: '_version', caption: 'Version', type: 'text', initial: "1.0.0 May 30 2016" },
  { 
        name: '_output', 
        caption: 'What to show :', 
        type: 'choice', 
        values: [0,1,2,3,4,-1,5,6,7,8,9,10,11,12,13,14,15,16,17], 
        initial: 1, 
        captions: ["-----", //0
                    "All printer assembly", //1
                    "printed parts plate", //2
                    "parts only", //3
                    "Walls and rods sizes", //4
                    "-----", // nope
                    "motor xy", //5
                    "bearings xy", //6
                    "slide y", //7
                    "z top", //8
                    "z bottom", //9
                    "z slide", //10
                    "head", //11
                    "extruder", //12
                    "Z stage", //13
                    "XY stage", //14
                    "screws", //15
                    "corners", //16
                    "test slot" //17
                    ]
    },
    { name: '_globalResolution', caption: 'output resolution (16, 24, 32)', type: 'int', initial: 32 },   
  
    { name: '_printableWidth', caption: 'Print width:', type: 'int', initial: 250 },
    { name: '_printableHeight', caption: 'Print height :', type: 'int', initial: 200 },
    { name: '_printableDepth', caption: 'Print depth :', type: 'int', initial: 250 },
    { name: '_wallThickness', caption: 'Box wood thickness:', type: 'int', initial: 15 },
    { name: '_XYrodsDiam', caption: 'X Y Rods diameter (6 or 8 ):', type: 'int', initial: 8},
    { name: '_ZrodsDiam', caption: 'Z Rods diameter (6,8,10,12):', type: 'int', initial: 8},
    
    
    {name: '_nemaXYZ', 
      type: 'choice',
      caption: 'Stepper motors type',
      values: [35, 42],
      captions: ["nema14","nema17"], 
      initial: 42
    },
    {name: '_offsetFront', caption: 'Offset Front/Back', type: 'int', initial: 0},
    {name: '_offsetSide', caption: 'Offset Side', type: 'int', initial: 15 },
    {name: '_offsetStand', caption: 'Offset Stand', type: 'int', initial: 15 },
    {name: '_offsetWall', caption: 'Walls Offset (0.1 mm)', type: 'int', initial: 8}
    /*
    {name: 'extrusionType', 
      type: 'choice',
      caption: 'Extrusion type',
      values: [0, 1],
      captions: ["direct","bowden"], 
      initial: 1
    }
    */
  ]; 
}



// -----------------  printed elements 

function zTop(){
    var width = _ZrodsWidth+_ZrodsDiam+(_rodsSupportThickness*2)+26;
    var mesh =  difference(
        union(
            //main
            cube({size:[width,_wallThickness+thickness*2,_wallThickness+thickness*2],center:true}),
            // z rod left support
            cylinder({r:_ZrodsDiam/2+thickness,h:10,fn:_globalResolution}).translate([-_ZrodsWidth/2,0,_wallThickness/2]),
            //z rod right support
            cylinder({r:_ZrodsDiam/2+thickness,h:10,fn:_globalResolution}).translate([_ZrodsWidth/2,0,_wallThickness/2]),
            //main fixing screw support
            cylinder({r:_ZrodsDiam/2,h:10,fn:_globalResolution}).translate([0,thickness,_wallThickness/2])
        ).setColor(0.2,0.7,0.2),
        union(
            cube({size:[width,_wallThickness,_wallThickness],center:true}),
            // z rod left
            cylinder({r:_ZrodsDiam/2,h:10,fn:_globalResolution}).translate([-_ZrodsWidth/2,0,_wallThickness/2]),
            //z rod right
            cylinder({r:_ZrodsDiam/2,h:10,fn:_globalResolution}).translate([_ZrodsWidth/2,0,_wallThickness/2]),
            //main fixing screw hole
            screwMetal(2.8,25).translate([0,thickness,0]),
            //left fixing screw hole
            screwMetal(2.8,20).rotateX(90).translate([-_ZrodsWidth/2,10,_wallThickness/2+6.5]),
            //left fixing screw hole
            screwMetal(2.8,20).rotateX(90).translate([_ZrodsWidth/2,10,_wallThickness/2+6.5])
            )
         );
    return mesh.rotateY(180);
}

/*function zTop(){
    var width = _ZrodsWidth+_ZrodsDiam+(_rodsSupportThickness*2)+26;
    var height = 12;
    var depth = 24;
    var insideWidth = 28;
    
    var mesh = union(
    
            difference(
                cube({size:[width,depth,height],center:true}),
                // outside form left
                cube({size:[13,depth,height],center:true}).translate([-width/2+6.5,-5,0]),
                // outside form right
                cube({size:[13,depth,height],center:true}).translate([width/2-6.5,-5,0]),
                //screw left
                slottedHole(4,8,depth).rotateX(90).rotateY(90).translate([-(width)/2+4,20,0]),
                //screw right
                slottedHole(4,8,depth).rotateX(90).rotateY(90).translate([(width)/2-9,20,0]),
                // z rod left
                cylinder({r:_ZrodsDiam/2,h:height,fn:_globalResolution}).translate([-_ZrodsWidth/2,depth/2-12,-height/2]),
                //z rod right
                cylinder({r:_ZrodsDiam/2,h:height,fn:_globalResolution}).translate([_ZrodsWidth/2,depth/2-12,-height/2]),
                // chamfer
                roundBoolean2(10,height,"bl").rotateX(90).rotateZ(-90).translate([-width/2+22,-depth/2+9,-height/2]),
                roundBoolean2(10,height,"bl").rotateX(90).translate([width/2-22,-depth/2+9,-height/2]),
                // inside form
                difference(
                    cube({size:[insideWidth,8,height],center:true}).translate([3,-5.5,0]),
                    // bearing washers 
                    cylinder({r:5,h:0.5,fn:_globalResolution}).rotateX(-90).translate([3,-9.5,0]),
                    cylinder({r:5,h:0.5,fn:_globalResolution}).rotateX(-90).translate([3,-2,0])
                ),
                // bearing hole
                cylinder({r:4,h:depth,fn:_globalResolution}).rotateX(-90).translate([3,-depth/2-4,0])
                
            )
        );
        
        var screws = union(
                screwMetalNut(8,20).rotateX(-90).translate([3,-depth/2-30,0]),
                screwWood(4,16).rotateX(-90).translate([-(width)/2+4,-20,0]),
                screwWood(4,16).rotateX(-90).translate([(width)/2-9,-20,0])
            );
        
		if(output==13){
			mesh = union(
					mesh,
					bearing608z().rotateX(-90).translate([3,-depth/2+3,0]),
					screws
				);
		}  
		if(output==15){
        mesh = screws;
		}   
        
    return mesh;
}*/

function zBottom(){
    var width = _ZrodsWidth+_ZrodsDiam+(_rodsSupportThickness*2)+26;
    var mesh =  difference(
        union(
            //main
            cube({size:[width,_wallThickness+thickness*2,_wallThickness+thickness*2],center:true}),
            // z rod left support
            cylinder({r:_ZrodsDiam/2+thickness,h:10,fn:_globalResolution}).translate([-_ZrodsWidth/2,0,_wallThickness/2]),
            //z rod right support
            cylinder({r:_ZrodsDiam/2+thickness,h:10,fn:_globalResolution}).translate([_ZrodsWidth/2,0,_wallThickness/2]),
            //main fixing screw support
            cylinder({r:_ZrodsDiam/2,h:10,fn:_globalResolution}).translate([0,thickness,_wallThickness/2]),
            //z-motor vertical support
            cube({size:[_nemaXYZ+thickness*2,thickness*2,_nemaXYZ+thickness]}).translate([-_nemaXYZ/2-thickness,-thickness-_wallThickness/2,-_wallThickness/2-thickness]),
            //z-motor horisontal support
            cube({size:[_nemaXYZ+thickness*2,-30,thickness]}).translate([-_nemaXYZ/2-thickness,-thickness-_wallThickness/2,-_wallThickness/2+_nemaXYZ-thickness])
            
        ).setColor(0.2,0.7,0.2),
        union(
            cube({size:[width,_wallThickness,_wallThickness],center:true}),
            // z rod left
            cylinder({r:_ZrodsDiam/2,h:10,fn:_globalResolution}).translate([-_ZrodsWidth/2,0,_wallThickness/2]),
            //z rod right
            cylinder({r:_ZrodsDiam/2,h:10,fn:_globalResolution}).translate([_ZrodsWidth/2,0,_wallThickness/2]),
            //main fixing screw hole
            screwMetal(2.8,25).translate([0,thickness,0]),
            //left fixing screw hole
            screwMetal(2.8,20).rotateX(90).translate([-_ZrodsWidth/2,10,_wallThickness/2+6.5]),
            //left fixing screw hole
            screwMetal(2.8,20).rotateX(90).translate([_ZrodsWidth/2,10,_wallThickness/2+6.5]),
            //z motor slot
            _nema().translate([-_nemaXYZ/2,-_nemaXYZ-_wallThickness/2,-thickness-_wallThickness/2]),
            //z motor hole
            nemaHole(_nemaXYZ).translate([0,-_nemaXYZ/2-_wallThickness/2,-_wallThickness/2+_nemaXYZ-thickness])
            )
         );
    return mesh;
}

/*function zBottom(){
    var width = _ZrodsWidth+_ZrodsDiam+(_rodsSupportThickness*2)+26;
    var height = 10;
    var depth = 22;
    var inside_cut_x = _ZrodsWidth-_ZrodsDiam-_rodsSupportThickness*2;
    var nemaoffsetholes = (_nemaXYZ==35)?13:15.5;

    var mesh =  difference(
            //main
            union(
                cube({size:[width,depth,height],center:true}).setColor(0.2,0.7,0.2),
                cube({size:[width/2,depth,10],center:true}).translate([0,-depth/2,0]).setColor(0.2,0.7,0.2)
                ),

            // inside form
            nemaHole(_nemaXYZ).rotateX(90).translate([0,0,_nemaXYZ/2-height/2]),
            cube({size:[inside_cut_x,depth,height],center:true}).translate([0,10,0]),
            // outside form left
            cube({size:[13,depth,height],center:true}).translate([-width/2+6.5,-5,0]),
            // outside form right
            cube({size:[13,depth,height],center:true}).translate([width/2-6.5,-5,0]),
            // z rod left
            cylinder({r:_ZrodsDiam/2,h:height,fn:_globalResolution}).translate([-_ZrodsWidth/2,depth/2-12,-height/2]),
            //z rod right
            cylinder({r:_ZrodsDiam/2,h:height,fn:_globalResolution}).translate([_ZrodsWidth/2,depth/2-12,-height/2]),

            // screws attach holes
            cylinder({r:2,h:5,fn:_globalResolution}).rotateX(-90).translate([width/2-5,depth/2-5,0]),
            cylinder({r:2,h:5,fn:_globalResolution}).rotateX(-90).translate([-width/2+5,depth/2-5,0])

        );
        
        var screws = union(
                screwWood(4,16).rotateX(-90).translate([width/2-5,-10,0]),
                screwWood(4,16).rotateX(-90).translate([-width/2+5,-10,0]),
                screwMetal(3,25).rotateX(90).translate([nemaoffsetholes,30,0]),
                screwMetal(3,25).rotateX(90).translate([-nemaoffsetholes,30,0])
            );
        
        if(output==13){
        mesh = union(
                mesh,
                screws
            );
		}
            
        if(output==15){
        mesh = screws;
		}  
        
        
    return mesh;
}
*/


function slideZ2(){
    var width = _ZrodsWidth-5;
    var height = 50;
    var depth = 5;
    var insideWidth = 35;
    var lmXuu_support_r = _rodsSupportThickness + _ZlmDiam / 2;
    var side_plate_size = 7;
    var side_form_size = lmXuu_support_r + side_plate_size;
    // lmXuu set screws offset
    var set_screw_offset = lmXuu_support_r + side_plate_size / 2 - 1;
    var nutRadius = 14.5/2;
    
        var mesh = difference(
            //main form
            union(
                cube({size:[width,depth,height]}),

                Gt2Holder2().rotateX(90).rotateY(90).translate([width/2-10,3,height-13]),

                //Gt2Holder(3).rotateX(90).rotateY(90).translate([width/2-10,1,10]).setColor(0.2,0.7,0.2),
                // lmXuu support
                cylinder({r:lmXuu_support_r,h:height,fn:_globalResolution}),
                cylinder({r:lmXuu_support_r,h:height,fn:_globalResolution}).translate([_ZrodsWidth,0,0]),
                // side forms for lmXuu attach
                cube({size:[side_form_size,10,height]}).translate([_ZrodsWidth,-4,0]),
                cube({size:[side_form_size,10,height]}).translate([-side_form_size,-4,0]),

                // extra forms front bearings holes
                cube([16,90,height]).translate([-8,-85,0]),
                cube([16,90,height]).translate([_ZrodsWidth-8,-85,0])

            ),
            // big hole middle
            cylinder({r:8,h:50,fn:_globalResolution}).rotateX(90).translate([width/2+12,40,height/2+10]),
            cylinder({r:5,h:50,fn:_globalResolution}).rotateX(90).translate([width/2+15,40,height/2-10]),
            cylinder({r:5,h:50,fn:_globalResolution}).rotateX(90).translate([width/2-10,40,height/2-10]),
            //  boolean front horizontal
            cylinder({r:80,h:width+40,fn:_globalResolution}).rotateY(90).translate([-20,-80,-40]),
            cylinder({r:5,h:width+40,fn:_globalResolution}).rotateY(90).translate([-20,-15,height-10]),
            // front form 
            cube([12,70,height]).translate([-10,-80,-5]),
            cube([12,70,height]).translate([_ZrodsWidth-2,-80,-5]),
            // z rod left linear bearing lm
            cylinder({r:_ZlmDiam/2,h:height,fn:_globalResolution}).translate([0,0,0]),
            //z rod right linear bearing lm
            cylinder({r:_ZlmDiam/2,h:height,fn:_globalResolution}).translate([_ZrodsWidth,0,0]),
            // side holes for lmXuu attach
            cube({size:[side_form_size+1,2,height]}).translate([_ZrodsWidth,0,0]),
            cube({size:[side_form_size+1,2,height]}).translate([-side_form_size-1,0,0]),
            // side holes for lmXuu screws
            cylinder({r:1.4,h:30,fn:_globalResolution}).rotateX(90).translate([_ZrodsWidth+set_screw_offset,20,height-10]),
            cylinder({r:1.4,h:30,fn:_globalResolution}).rotateX(90).translate([_ZrodsWidth+set_screw_offset,20,10]),
            cylinder({r:1.4,h:30,fn:_globalResolution}).rotateX(90).translate([-set_screw_offset,20,height-10]),
            cylinder({r:1.4,h:30,fn:_globalResolution}).rotateX(90).translate([-set_screw_offset,20,10]),
            // top holes
            cylinder({r:2,h:30,fn:_globalResolution}).translate([-4,-20,height-30]),
            cylinder({r:2,h:30,fn:_globalResolution}).translate([_ZrodsWidth+3,-20,height-30]),
            cylinder({r:2,h:30,fn:_globalResolution}).translate([-4,-75,height-30]),
            cylinder({r:2,h:30,fn:_globalResolution}).translate([_ZrodsWidth+3,-75,height-30]),
            // special hole in gt2 holder to be able to get the belt out .. but still printable vertically.
                linear_extrude({height:20},polygon({points:[[0,0],[6,0],[4,10],[2,10]]})).rotateY(-90).translate([width/2+5,-10,height-15])
            );
            
            var screws = union(
						screwMetal(3,10).rotateX(-90).translate([_ZrodsWidth+set_screw_offset,-20,height-10]),
						screwMetal(3,10).rotateX(-90).translate([_ZrodsWidth+set_screw_offset,-20,10]),
						screwMetal(3,10).rotateX(-90).translate([-set_screw_offset,-20,height-10]),
						screwMetal(3,10).rotateX(-90).translate([-set_screw_offset,-20,10]),
						
						screwWood(4,13).translate([-4,-20,height-30]),
						screwWood(4,13).translate([_ZrodsWidth+3,-20,height-30]),
						screwWood(4,13).translate([-4,-75,height-30]),
						screwWood(4,13).translate([_ZrodsWidth+3,-75,height-30])
						
					);
            
            
            if(output==13){
				mesh = union(
						mesh,
						screws
					);
			}
			if(output==15){
				mesh = screws;
			} 
            
            return mesh;
}




function slideY(side){
var mesh;
    
    var Y = 20;
    var Z = 40;
    var bearingsOffsetZ = 13;
    var bearingsOffsetX = 20;
    var bearingHoleOffsetX = bearingsOffsetX+13;
    var X = 40;
    mesh = difference(
        
        union(
            difference(
                //main
                cube({size:[X,Y,Z]}).translate([15,0,0]),
                // support bearings
                cube({size:[X,Y,8]}).translate([6.5,0,bearingsOffsetZ]),
                cube({size:[X,Y,8]}).translate([6.5,0,bearingsOffsetZ+11])
                ),
            // rodx extra form on top and bottom to fix the rods
            //cube({size:[10,Y,5]}).translate([X+5,0,-5]),
            cube({size:[10,Y,5]}).translate([X+5,0,Z]),
            //cylinder({r:5,h:Y,fn:_globalResolution}).rotateX(-90).translate([X+10,0,-5]),
            cylinder({r:5,h:Y,fn:_globalResolution}).rotateX(-90).translate([X+10,0,Z+5]),
            //rodx extra fillet 
            // fillet
             roundBoolean2(3,Y,"tl").translate([X+2,0,Z]),
             roundBoolean2(3,Y,"bl").translate([X+2,0,-3]),
            // round bearings supports in middle
            cylinder({r:5,h:0.5,fn:_globalResolution}).translate([bearingHoleOffsetX,Y/2,bearingsOffsetZ]),
            cylinder({r:5,h:4,fn:_globalResolution}).translate([bearingHoleOffsetX,Y/2,bearingsOffsetZ+7.5]),
            cylinder({r:5,h:0.5,fn:_globalResolution}).translate([bearingHoleOffsetX,Y/2,bearingsOffsetZ+11+7.5]),

            //extra rod Y support
            cylinder({r:_XYlmDiam/2+3.5,h:Y+10,fn:_globalResolution}).rotateX(-90).translate([14,-10,5]),
            cube({size:[12,Y+10,6]}).translate([0,-10,2])


        ),
        // cut bearings support part
        cube({size:[10,Y,30]}).translate([10,0,20]),
        // and add some chamfreins
        roundBoolean2(3,20,"tr").rotateX(-90).translate([20,0,40]),
        roundBoolean2(3,20,"br").rotateX(-90).translate([20,Y-3,40]),

        // long bearing hole
        cylinder({r:4.1,h:Z-bearingsOffsetZ,fn:_globalResolution}).translate([bearingHoleOffsetX,Y/2,bearingsOffsetZ]),
        cylinder({r:3.8,h:bearingsOffsetZ,fn:_globalResolution}).translate([bearingHoleOffsetX,Y/2,0]),
        // screw for endstop X
        //cylinder({r:1.3,h:12,fn:_globalResolution}).rotateX(90).translate([X+12,Y+1,13]),
        // rod Y bool
        cylinder({r:_XYlmDiam/2+0.1,h:Y+15,fn:_globalResolution}).rotateX(-90).translate([14,-15,5]),
        // rod Y support slice boolean 
        cube({size:[10,Y+10,1]}).translate([0,-10,4.5]),
        
        // Xrods hole top
        cylinder({r:_XYrodsDiam/2,h:15,fn:_globalResolution}).rotateY(90).translate([X+3,Y/2,Z]),

        // Xrods hole bottom
        cylinder({r:_XYrodsDiam/2,h:15,fn:_globalResolution}).rotateY(90).translate([X+3,Y/2,0]),

        // Xrods slice bottom top 
        //cube({size:[13,1,10]}).translate([X+2,Y/2,-10]),
        cube({size:[13,1,10]}).translate([X+2,Y/2,Z]),
        
        // screws to fix rod X 
        cylinder({r:1.3,h:Y,fn:_globalResolution}).rotateX(-90).translate([X+10,0,Z+5]),

        // screws for rod Y support
        cylinder({r:1.3,h:20,fn:_globalResolution}).translate([3,-5,0]),
        cylinder({r:1.3,h:30,fn:_globalResolution}).translate([3,15,-20])
        

    );

	var screws = union(
		screwMetal(3,10).translate([3,-5,-10]),
		screwMetal(3,10).translate([3,15,-10]),
		screwMetalNut(8,30).rotateX(180).translate([bearingHoleOffsetX,Y/2,80])
	
	);
	
    if(side=="left"){
        mesh = union(
                mesh,
                text3d("L").scale(0.3).translate([15,5,14.8]),
                // extra part for endstop X to click on 
                difference(
                    cube({size:[10,Y+5,14]}).translate([X+5,-5,-14]),
                    cylinder({r:1.3,h:Y+10,fn:_globalResolution}).rotateX(-90).translate([X+10,-6,-5]),
                    cube({size:[13,1,12]}).translate([X+2,Y/2,-12]),
                    // Xrods hole bottom
                    cylinder({r:_XYrodsDiam/2,h:12,fn:_globalResolution}).rotateY(90).translate([X+3,Y/2,0]),
                    //extra remove
                    cylinder({r:20,h:10,fn:_globalResolution}).rotateX(-90).rotateZ(90).translate([X+15,20,-28])
                )
        
                );
    }
    if(side=="right"){
        mesh = union(
                mesh,
                text3d("R").scale(0.3).rotateY(180).translate([22,5,15.4]),
                // bottom round only on right part 
                difference(
                    union(
                    cube({size:[10,Y,5]}).translate([X+5,0,-5]),
                    cylinder({r:5,h:Y,fn:_globalResolution}).rotateX(-90).translate([X+10,0,-5])
                    ),
                cylinder({r:1.3,h:Y,fn:_globalResolution}).rotateX(-90).translate([X+10,0,-5]),
                cube({size:[13,1,10]}).translate([X+2,Y/2,-10]),
                // Xrods hole bottom
                cylinder({r:_XYrodsDiam/2,h:12,fn:_globalResolution}).rotateY(90).translate([X+5,Y/2,0])
                ),
                // extra part for endstop Y click
                difference(
					cube({size:[7,Y-10,10]}).translate([0,Y-(Y-10),-8]),
					cylinder({r:1.3,h:30,fn:_globalResolution}).translate([3,15,-20])
				)
        
                );
    }
    if(output==1){
        mesh = union(
                mesh,
                bearing608z().translate([bearingHoleOffsetX,Y/2,2.5]),
                bearing608z().translate([bearingHoleOffsetX,Y/2,26.5])
                //screws
            );
    }
    
    if(output==14){
        mesh = union(
                mesh,
                bearing608z().translate([bearingHoleOffsetX,Y/2,15.5]),
                bearing608z().translate([bearingHoleOffsetX,Y/2,26.5]),
                screws
            );
    }
	if(output==15){
		mesh = screws;
	}
    return mesh;



}




function head(){
    var mesh;
    var X = (2*_XYlmLength)+12;
    var Y = _XYlmDiam + 8;
    var Z = _XYlmDiam + 40;
    var zOffset = 12 -_XYlmDiam /2;
    var xrodOffset = 40;
    var washer = (X-(2*_XYlmLength))/3; 
    var headAttachHolesXwidth = 22;


    mesh = difference(
        
        union(
            cube({size:[X,Y,Z]}).translate([0,0,zOffset]),
            //gt2 holders 
            Gt2HolderSuspendedLeft(3).translate([0,-5,27]),
            Gt2HolderSuspendedRight(3).translate([0,_XYlmDiam +5,37]),
            // support for endstop X
            cube({size:[10,10,6]}).translate([0,-7,zOffset]),
            Gt2HolderSuspendedLeft(3).translate([X-10,-5,37]),
            Gt2HolderSuspendedRight(3).translate([X-10,_XYlmDiam +5,27]) 

        ),
        //rod x holes
        //bottom
        union(
            cylinder({r:_XYlmDiam/2,h:X,fn:_globalResolution}).rotateY(90).translate([0,Y/2,15]),
            cube({size:[X,5,5]}).rotateX(45).translate([0,Y/2,15.5]),
            cube({size:[X,1,8]}).translate([0,Y/2-0.5,zOffset])
            ),
        // top
        union(
            cylinder({r:_XYlmDiam/2-1,h:washer,fn:_globalResolution}).rotateY(90).translate([0,Y/2,15+xrodOffset-1]),
            cube({size:[washer,_XYlmDiam-2,10]}).translate([0,Y/2-_XYlmDiam/2+1,15+xrodOffset-1]),
            cylinder({r:_XYlmDiam/2,h:_XYlmLength,fn:_globalResolution}).rotateY(90).translate([washer,Y/2,15+xrodOffset-1]),
            cube({size:[_XYlmLength,_XYlmDiam,10]}).translate([washer,Y/2-_XYlmDiam/2,15+xrodOffset-1]),
            cylinder({r:_XYlmDiam/2-1,h:washer,fn:_globalResolution}).rotateY(90).translate([washer+_XYlmLength,Y/2,15+xrodOffset-1]),
            cube({size:[washer,_XYlmDiam-2,10]}).translate([washer+_XYlmLength,Y/2-_XYlmDiam/2+1,15+xrodOffset-1]),
            cylinder({r:_XYlmDiam/2,h:_XYlmLength,fn:_globalResolution}).rotateY(90).translate([2*washer+_XYlmLength,Y/2,15+xrodOffset-1]),
            cube({size:[_XYlmLength,_XYlmDiam,10]}).translate([2*washer+_XYlmLength,Y/2-_XYlmDiam/2,15+xrodOffset-1]),
            cylinder({r:_XYlmDiam/2-1,h:washer,fn:_globalResolution}).rotateY(90).translate([2*washer+2*_XYlmLength,Y/2,15+xrodOffset-1]),
            cube({size:[washer,_XYlmDiam-2,10]}).translate([2*washer+2*_XYlmLength,Y/2-_XYlmDiam/2+1,15+xrodOffset-1])
            ),
        // head attach holes 
         cylinder({r:1.3,h:Y,fn:_globalResolution}).rotateX(-90).translate([X/2-headAttachHolesXwidth/2,0,40]),
         cylinder({r:1.3,h:Y,fn:_globalResolution}).rotateX(-90).translate([X/2-headAttachHolesXwidth/2,0,28]),
         cylinder({r:1.3,h:Y,fn:_globalResolution}).rotateX(-90).translate([X/2+headAttachHolesXwidth/2,0,40]),
         cylinder({r:1.3,h:Y,fn:_globalResolution}).rotateX(-90).translate([X/2+headAttachHolesXwidth/2,0,28]),
         
        // screw to fix endstop X under 
         cylinder({r:1.6,h:10,fn:_globalResolution}).translate([3,-2,5]) ,
         // screw to fix bottom Xrod
         cylinder({r:1.6,h:Y,fn:_globalResolution}).rotateX(-90).translate([X/2,0,9])   

    );
    
    var screws = union(
		screwMetal(3,16).rotateX(-90).translate([X/2-headAttachHolesXwidth/2,-20,40]),
		screwMetal(3,16).rotateX(-90).translate([X/2-headAttachHolesXwidth/2,-20,28]),
		screwMetal(3,16).rotateX(-90).translate([X/2+headAttachHolesXwidth/2,-20,40]),
		screwMetal(3,16).rotateX(-90).translate([X/2+headAttachHolesXwidth/2,-20,28])
		
	
	);
    if(output==14){
        mesh = union(
                mesh,
                screws
            );
    }
    if(output==15){
		mesh = screws;
	}
    
    return mesh;

}

function HeadSupportJhead(){
    var width = 40;
    var height = 35;
    var depth = 15;
    var extDiam=15.1;
    var intDiam=12.1;
    var intDiamHeight=5;
    return difference(
        union(
            //base
            cube({size:[28,5,height]}).translate([(width-28)/2,0,0]),
            // top
            cube({size:[width,depth,8]}).translate([0,0,height-8]),
            // fillet
            roundBoolean2(5,28,"br").rotateZ(90).translate([width-6,5,height-13])
            
        ),
        // jhead holes 
         cylinder({r:extDiam/2+0.1,h:height-5,fn:_globalResolution}).translate([width/2,depth+1,0]),
         cylinder({r:intDiam/2+0.1,h:intDiamHeight,fn:_globalResolution}).translate([width/2,depth+1,height-5]),
         cylinder({r:13,h:height-12,fn:_globalResolution}).translate([width/2,depth+1,0]),
         // jhead attach holes 
         cylinder({r:1.3,h:30,fn:_globalResolution}).rotateX(-90).translate([width/2-endxJheadAttachHolesWidth/2,0,height-4]),
         cylinder({r:1.3,h:30,fn:_globalResolution}).rotateX(-90).translate([width/2+endxJheadAttachHolesWidth/2,0,height-4]),

         // head attach holes 
         slottedHole(3.2,8,10).rotateX(90).translate([width/2-11,depth-5,5]),
         slottedHole(3.2,8,10).rotateX(90).translate([width/2+11,depth-5,5]),
         slottedHole(3.2,8,10).rotateX(90).translate([width/2-11,depth-5,18]),
         slottedHole(3.2,8,10).rotateX(90).translate([width/2+11,depth-5,18]),
         // extra hole back right to let space to insert belt. ( and left too , to be equal )
         cylinder({r:8,h:10,fn:_globalResolution}).translate([0,0,height-10]),
         cylinder({r:8,h:10,fn:_globalResolution}).translate([width,0,height-10])

    );
}



function InductiveSensorSupport(){
    var width = 45;
    var height = 8;
    var depth = 12;
    var extDiam=15.1;
    var intDiam=12.1;
    var intDiamHeight=5;
    return difference(
        union(
            //base
            cube({size:[width,depth,height]}),
            // inductive support
            cube({size:[8,depth,30]}).translate([width-8,0,-25]),
            cube({size:[35,depth+15,5]}).translate([width-8,0,-25])
            
            
        ),
        // jhead holes 
         cylinder({r:extDiam/2+0.1,h:3,fn:_globalResolution}).translate([width/2,depth,0]),
         cylinder({r:intDiam/2+0.1,h:intDiamHeight,fn:_globalResolution}).translate([width/2,depth,height-5]),
         
         // head attach holes 
         cylinder({r:1.6,h:13,fn:_globalResolution}).rotateX(-90).translate([width/2-endxJheadAttachHolesWidth/2,0,height/2]),
        cylinder({r:1.6,h:13,fn:_globalResolution}).rotateX(-90).translate([width/2+endxJheadAttachHolesWidth/2,0,height/2]),

         // inductive support hole
         cylinder({r:9.3,h:height,fn:_globalResolution}).translate([width+15,depth+2,-25]),
         // chamfer
         roundBoolean2(17,10,"br").rotateX(-90).translate([width-8,depth-2,-18]),
         roundBoolean2(17,10,"bl").rotateX(-90).translate([width+15,depth-2,-18])

    );
}

function motorXY(side){
    var motorlen = armlen;
    if (motorlen<(_nemaXYZ+_wallThickness+thickness*2)){
        motorlen = _nemaXYZ+_wallThickness+thickness*2;
    }
    var mesh = difference(
    union(
        // base
        cube({size:[_nemaXYZ/2-5,_nemaXYZ,thickness+2]}),
        // wall support
        cube({size:[9,_nemaXYZ,20]}),
        // central cube
        cube({size:[_wallThickness,_wallThickness,_wallThickness]}).translate([-_wallThickness,-_wallThickness-thickness,20-_wallThickness]),
        // top
        linear_extrude({ height: thickness }, polygon({ points: [[0,0], [0, motorlen], [_wallThickness+thickness*2, motorlen],[_wallThickness+thickness+9, motorlen-thickness],[_wallThickness+thickness+9, _wallThickness+thickness+9],[_wallThickness+thickness*2+9, _wallThickness+thickness*2],[armlen, _wallThickness+thickness*2], [armlen,0]] })).translate([-_wallThickness-thickness,-_wallThickness-thickness*2,20]),
        //side wall
        linear_extrude({ height: thickness }, polygon({ points: [[0,0], [0, armlen], [_wallThickness+thickness*2, armlen], [motorlen, _wallThickness+thickness*2], [motorlen,0]] })).rotateX(-90).rotateZ(90).translate([-_wallThickness,-_wallThickness-thickness*2,20+thickness]),
        // front wall
        linear_extrude({ height: thickness }, polygon({ points: [[0,0], [0, armlen], [_wallThickness+thickness*2, armlen], [armlen, _wallThickness+thickness*2], [armlen,0]] })).rotateX(-90).translate([-_wallThickness-thickness,-_wallThickness-thickness*2,20+thickness]),
        // socket walls
        cube({size:[armlen-_wallThickness-thickness,thickness,_wallThickness+thickness]}).translate([0, -thickness, 20-_wallThickness-thickness]),
        cube({size:[armlen-_wallThickness-thickness,_wallThickness+thickness,thickness]}).translate([0, -_wallThickness-thickness, 20-_wallThickness-thickness]),
        cube({size:[thickness,armlen-_wallThickness-thickness,_wallThickness+thickness]}).translate([0, -thickness, 20-_wallThickness-thickness]),
        cube({size:[_wallThickness+thickness,motorlen-_wallThickness-thickness,thickness]}).translate([-_wallThickness-thickness, -thickness, 20-_wallThickness-thickness]),
        cube({size:[_wallThickness+thickness,thickness,-armlen+_wallThickness+thickness]}).translate([-_wallThickness-thickness, -thickness, 20-_wallThickness]),
        cube({size:[thickness,_wallThickness+thickness,-armlen+_wallThickness+thickness]}).translate([0, -_wallThickness-thickness, 20-_wallThickness]),
        // rod support - half slotted hole
        cylinder({r:_XYrodsDiam/2+3,h:15,fn:_globalResolution}).rotateX(90).translate([20,_nemaXYZ,4]),
        cube({size:[20,15,_XYrodsDiam/2+3]}).translate([_nemaXYZ/2+_XYrodsDiam/2+1-25,_nemaXYZ-15,-1])


    ),
    nemaHole(_nemaXYZ).translate([_nemaXYZ/2,_nemaXYZ/2,-1]),
    // rod support hole
    cylinder({r:_XYrodsDiam/2,h:12,fn:_globalResolution}).rotateX(90).translate([20,_nemaXYZ,4]),
    //extra bool for printable
    cube({size:[15,10,15]}).rotateZ(30).translate([_nemaXYZ/2,_nemaXYZ-19.5,0]),
    // round
    //roundBoolean2(5,_nemaXYZ,"br").translate([-_wallThickness-thickness,0,thickness+30]),
    //  holes to fix on the wood side - version simple
    // wood screw holes
    //cylinder({r:2.1,h:20,fn:_globalResolution}).rotateX(-90).rotateZ(90).translate([-_wallThickness,5,5]),
    //cylinder({r:2.1,h:20,fn:_globalResolution}).rotateX(-90).rotateZ(90).translate([-_wallThickness,_nemaXYZ-5,5]),
    // extra nema bool (motor body)
    cube({size:[_nemaXYZ,_nemaXYZ,_nemaXYZ]}).translate([0,0,-_nemaXYZ])
    );
    //offsets
    //front/back offset
    if(_offsetFront>0){
        mesh = union(
            mesh,
            cube({size:[_offsetFront/2,_wallThickness,_wallThickness]}).translate([0,-_wallThickness-thickness,20-_wallThickness]).setColor(0.5,1,0.5)
        );
    }
    //side offset
    if(_offsetSide>0){
        mesh = union(
            mesh,
            cube({size:[_wallThickness,_offsetSide/2,_wallThickness]}).translate([-_wallThickness,-thickness,20-_wallThickness]).setColor(0.5,1,0.5)
        );
    }
    //stand offset
    if(_offsetStand>0){
        mesh = union(
            mesh,
            cube({size:[_wallThickness,_wallThickness,_offsetStand/2]}).translate([-_wallThickness,-_wallThickness-thickness,20-_wallThickness-_offsetStand/2]).setColor(0.5,1,0.5)
        );
    }
    
    //side modifier
    if(side=="left"){
        mesh = union(
                mesh,
                text3d("SIDE").scale(0.3).rotateX(90).rotateZ(90).translate([9,motorlen/4-5,_wallThickness/2+3])
                );
    }
    if(side=="right"){
        mesh = union(
                mesh,
                // extra long to attach y endstop

                text3d("R").scale(0.3).rotateY(180).translate([_wallThickness+20,_wallThickness+20,15+thickness+0.5])
                );
    }
    
    var screws = union(
		screwMetal(3,30).rotateX(180).translate([_nemaXYZ/2-15,_nemaXYZ/2-15,50]),
		screwMetal(3,30).rotateX(180).translate([_nemaXYZ/2-15,_nemaXYZ/2+15,50])
	);
	
	 if(output==14){
        mesh = union(
                mesh,
                screws
            );
    }
    if(output==15){
		mesh = screws;
	}
	
    return mesh;
}

function cornerLR(side){
    var mesh = union(
        // central cube
        cube({size:[_wallThickness,_wallThickness,_wallThickness]}).translate([thickness, thickness, thickness]),
        //bottom plate
        linear_extrude({ height: thickness }, polygon({ points: [[0,0], [0, armlen], [_wallThickness+thickness*2, armlen], [armlen, _wallThickness+thickness*2], [armlen,0]] })),
        //front/back plate
        linear_extrude({ height: thickness }, polygon({ points: [[0,0], [0, armlen], [_wallThickness+thickness*2, armlen], [armlen, _wallThickness+thickness*2], [armlen,0]] })).rotateX(90).translate([0,thickness,0]),
        //side plate
        linear_extrude({ height: thickness }, polygon({ points: [[0,0], [0, armlen], [_wallThickness+thickness*2, armlen], [armlen, _wallThickness+thickness*2], [armlen,0]] })).rotateX(90).rotateZ(90).translate([0,0,0]),
        //socket walls
        cube({size:[armlen-_wallThickness-thickness,thickness,_wallThickness+thickness]}).translate([thickness+_wallThickness, thickness+_wallThickness, thickness]),
        cube({size:[armlen-_wallThickness-thickness,_wallThickness+thickness,thickness]}).translate([thickness+_wallThickness, thickness, thickness+_wallThickness]),
        cube({size:[thickness,armlen-_wallThickness-thickness,_wallThickness+thickness]}).translate([thickness+_wallThickness, thickness+_wallThickness, thickness]),
        cube({size:[_wallThickness+thickness,armlen-_wallThickness-thickness,thickness]}).translate([thickness, thickness+_wallThickness, thickness+_wallThickness]),
        cube({size:[thickness,_wallThickness+thickness,armlen-_wallThickness-thickness]}).translate([thickness+_wallThickness, thickness, thickness+_wallThickness]),
        cube({size:[_wallThickness+thickness,thickness,armlen-_wallThickness-thickness]}).translate([thickness, thickness+_wallThickness, thickness+_wallThickness])
    );
    //offsets
    //front/back offset
    if(_offsetFront>0){
        mesh = union(
            mesh,
            cube({size:[_offsetFront/2,_wallThickness,_wallThickness]}).translate([thickness+_wallThickness, thickness, thickness]).setColor(0.5,1,0.5)
        );
    }
    //side offset
    if(_offsetSide>0){
        mesh = union(
            mesh,
            cube({size:[_wallThickness,_offsetSide/2,_wallThickness]}).translate([thickness, thickness+_wallThickness, thickness]).setColor(0.5,1,0.5)
        );
    }
    //stand offset
    if(_offsetStand>0){
        mesh = union(
            mesh,
            cube({size:[_wallThickness,_wallThickness,_offsetStand/2]}).translate([thickness, thickness, thickness+_wallThickness]).setColor(0.5,1,0.5)
        );
    }
    //screw holes
    var screw_size = 3;
    var hole_offset_front = (armlen-_wallThickness-_offsetFront/2-thickness*2)/3;
    var hole_offset_side = (armlen-_wallThickness-_offsetSide/2-thickness*2)/3;
    var hole_offset_stand = (armlen-_wallThickness-_offsetStand/2-thickness*2)/3;
    if(hole_offset_front>screw_size*2){
        mesh = difference(
                mesh,
                union(
                    screwWood(screw_size,_wallThickness*2).rotateX(-90).translate([_wallThickness+thickness*2+_offsetFront/2+hole_offset_front,0,thickness+_wallThickness/2]),
                    screwWood(screw_size,_wallThickness*2).rotateX(-90).translate([_wallThickness+thickness*2+_offsetFront/2+hole_offset_front*2,0,thickness+_wallThickness/2])
                 )
            );
    } else{
        mesh = difference(
            mesh,
            screwWood(screw_size,_wallThickness*2).rotateX(-90).translate([_wallThickness+thickness*2+_offsetFront/2+hole_offset_front*1.5,0,thickness+_wallThickness/2])
        );
    }
    //side holes
    if(hole_offset_side>screw_size*2){
        mesh = difference(
                mesh,
                union(
                    screwWood(screw_size,_wallThickness*2).rotateX(-90).rotateZ(-90).translate([0,_wallThickness+thickness*2+_offsetSide/2+hole_offset_side,thickness+_wallThickness/2]),
                    screwWood(screw_size,_wallThickness*2).rotateX(-90).rotateZ(-90).translate([0,_wallThickness+thickness*2+_offsetSide/2+hole_offset_side*2,thickness+_wallThickness/2])
                 )
            );
    } else{
        mesh = difference(
            mesh,
            screwWood(screw_size,_wallThickness*2).rotateX(-90).rotateZ(-90).translate([0,_wallThickness+thickness*2+_offsetSide/2+hole_offset_side*1.5,thickness+_wallThickness/2])
        );
    }
    //top holes
    if(hole_offset_stand>screw_size*2){
        mesh = difference(
                mesh,
                union(
                    screwWood(screw_size,_wallThickness*2).rotateX(-90).rotateZ(-90).translate([0,thickness+_wallThickness/2,_wallThickness+thickness*2+_offsetStand/2+hole_offset_stand]),
                    screwWood(screw_size,_wallThickness*2).rotateX(-90).rotateZ(-90).translate([0,thickness+_wallThickness/2,_wallThickness+thickness*2+_offsetStand/2+hole_offset_stand*2])
                 )
            );
    } else{
        mesh = difference(
            mesh,
            screwWood(screw_size,_wallThickness*2).rotateX(-90).rotateZ(-90).translate([0,thickness+_wallThickness/2,_wallThickness+thickness*2+_offsetStand/2+hole_offset_stand*1.5])
        );
    }
    //bottom hole
        mesh = difference(
            mesh,
            screwWood(screw_size,_wallThickness*2).rotateX(180).translate([armlen/2,armlen/2,thickness])
        );
    //side modifier
    if(side=="left"){
        mesh = union(
                mesh,
                text3d("<F/B").rotateZ(180).scale(0.3).translate([armlen-5,15,_wallThickness+thickness*2])
        
                );
    }
    if(side=="right"){
        mesh = union(
                mesh,
                // extra long to attach y endstop

                text3d("F/B>").scale(0.3).rotateY(180).rotateZ(180).translate([armlen-30,15,_wallThickness+thickness*2])
                );
    }
    /*
    var screws = union(
		screwMetal(3,30).rotateX(180).translate([_nemaXYZ/2-15,_nemaXYZ/2-15,50]),
		screwMetal(3,30).rotateX(180).translate([_nemaXYZ/2-15,_nemaXYZ/2+15,50])
		
		
		
	
	);
	
	 if(output==14){
        mesh = union(
                mesh,
                screws
            );
    }
    if(output==15){
		mesh = screws;
	}
	*/
    return mesh;
}

function bearingsXY(side){
    var mesh;
    var corner_wall;
    var bearingsHeight = 8;
    var X = 20; //width of bearings base
    var Z = thickness*3+bearingsHeight*2; //height of bearings base
    var Y = 49; //depth of bearings base
    var bearingSlot = 22; //size of bearing slot
    var beltSlot = 4; //size of belt slot
    corner_wall = linear_extrude({ height: thickness }, polygon({ points: [[0,0], [0, armlen], [_wallThickness+thickness*2, armlen], [armlen, _wallThickness+thickness*2], [armlen,0]] }));
    mesh = union(
        //central cube
        cube({size:[_wallThickness,_wallThickness,_wallThickness]}).translate([0, 0, 0]),
        //bearings base
        roundedCube(X, Y, Z, thickness).translate([_wallThickness+thickness*2, _wallThickness+thickness, _wallThickness+thickness/2-Z/2]),
        //cube({size:[X,Y,Z]}).translate([_wallThickness+thickness*2, _wallThickness+thickness, _wallThickness+thickness/2-Z/2]),
        //top wall
        corner_wall.translate([-thickness, -thickness, _wallThickness]),
        //front wall
        corner_wall.rotateX(-90).translate([-thickness, -thickness, _wallThickness+thickness]),
        //side wall
        corner_wall.rotateX(-90).rotateZ(90).translate([0, -thickness, _wallThickness+thickness]),
        //socket walls
        cube({size:[armlen-_wallThickness-thickness,thickness,_wallThickness+thickness]}).translate([_wallThickness, _wallThickness, -thickness]),
        cube({size:[armlen-_wallThickness-thickness,_wallThickness+thickness,thickness]}).translate([_wallThickness, 0, -thickness]),
        cube({size:[thickness,armlen-_wallThickness-thickness,_wallThickness+thickness]}).translate([_wallThickness, _wallThickness, -thickness]),
        cube({size:[_wallThickness+thickness,armlen-_wallThickness-thickness,thickness]}).translate([0, _wallThickness, -thickness]),
        cube({size:[thickness,_wallThickness+thickness,armlen-_wallThickness-thickness]}).translate([_wallThickness, 0, -armlen+_wallThickness+thickness]),
        cube({size:[_wallThickness+thickness,thickness,armlen-_wallThickness-thickness]}).translate([0, _wallThickness, -armlen+_wallThickness+thickness]),
        //extra for y rod
        roundedCube(Z, _XYrodsDiam+thickness*2, X,  _XYrodsDiam/2+thickness).rotateY(-90).translate([_wallThickness+X+thickness,_wallThickness+thickness+10,-8])
        //cylinder({r:_XYrodsDiam/2+thickness,h:X,fn:_globalResolution}).rotateY(-90).translate([_wallThickness+X+thickness,_wallThickness+X+thickness,0])
        
    );
    //offsets
    //front/back offset
    if(_offsetFront>0){
        mesh = union(
            mesh,
            cube({size:[_offsetFront/2,_wallThickness,_wallThickness]}).translate([0, _wallThickness, 0]).setColor(0.5,1,0.5)
        );
    }
    //side offset
    if(_offsetSide>0){
        mesh = union(
            mesh,
            cube({size:[_wallThickness,_offsetSide/2,_wallThickness]}).translate([_wallThickness, 0, 0]).setColor(0.5,1,0.5)
        );
    }
    //stand offset
    if(_offsetStand>0){
        mesh = union(
            mesh,
            cube({size:[_wallThickness,_wallThickness,-_offsetStand/2]}).translate([0, 0, 0]).setColor(0.5,1,0.5)
        );
    }
    mesh = difference(
        mesh,
        union(            
            // support bearings
            cube({size:[X,bearingSlot+beltSlot,bearingsHeight]}).translate([_wallThickness+thickness*2,_wallThickness+thickness+Y-bearingSlot-beltSlot, _wallThickness+thickness]),
            cube({size:[X,bearingSlot+beltSlot,bearingsHeight]}).translate([_wallThickness+thickness*2,_wallThickness+thickness+Y-bearingSlot-beltSlot, _wallThickness-bearingsHeight])
        )
    );
    mesh = union(
            mesh,
            // round bearings supports in middle
            cylinder({r:5,h:0.5,fn:_globalResolution}).translate([_wallThickness+thickness*2+X/2, _wallThickness+Y-bearingSlot/2,_wallThickness+thickness+bearingsHeight-0.5]),
            cylinder({r:5,h:0.5,fn:_globalResolution}).translate([_wallThickness+thickness*2+X/2, _wallThickness+Y-bearingSlot/2,_wallThickness+thickness]),
            cylinder({r:5,h:0.5,fn:_globalResolution}).translate([_wallThickness+thickness*2+X/2, _wallThickness+Y-bearingSlot/2,_wallThickness-0.5]),
            cylinder({r:5,h:0.5,fn:_globalResolution}).translate([_wallThickness+thickness*2+X/2, _wallThickness+Y-bearingSlot/2,_wallThickness-bearingsHeight])
        );
    mesh = difference(
            mesh,
            union (
            // long bearing hole
            cylinder({r:4.1,h:40,fn:_globalResolution}).translate([_wallThickness+thickness*2+X/2, _wallThickness+Y-bearingSlot/2, _wallThickness+thickness/2-Z/2]),
            // y rod hole
            cylinder({r:_XYrodsDiam/2,h:12,fn:_globalResolution}).rotateX(-90).rotateZ(90).translate([_wallThickness+X+thickness,_wallThickness+thickness+17,-1])
            )
        );
    //show bearings in some views    
    if(output==1){
        mesh = union(
                mesh,
                bearing608z().translate([_wallThickness+thickness*2+X/2,_wallThickness+Y-bearingSlot/2,_wallThickness+thickness]),
                bearing608z().translate([_wallThickness+thickness*2+X/2,_wallThickness+Y-bearingSlot/2,_wallThickness-bearingsHeight])
            );
    }
    if(output==14){
        mesh = union(
                mesh,
                bearing608z().translate([_wallThickness+thickness*2+X/2,_wallThickness+Y-bearingSlot/2,_wallThickness+thickness]),
                bearing608z().translate([_wallThickness+thickness*2+X/2,_wallThickness+Y-bearingSlot/2,_wallThickness-bearingsHeight]),
                screws
            );
    }
    return mesh;
}

function ruler(){
    return cube([400,20,3]).setColor(0.4,0.8,0.4,0.5);
}

function test_slot(){
    var mesh = union(
        //central cube
        cube({size:[thickness*2,_wallThickness,_wallThickness]}).translate([-thickness, 0, 0]),
        //socket walls
        cube({size:[armlen/2, thickness, _wallThickness+thickness*2]}).translate([0, -thickness, -thickness]),
        cube({size:[armlen/2, thickness, _wallThickness+thickness*2]}).translate([0, _wallThickness, -thickness]),
        cube({size:[armlen/2,_wallThickness+thickness,thickness]}).translate([0, 0, _wallThickness]),
        cube({size:[armlen/2,_wallThickness+thickness,thickness]}).translate([0, 0, -thickness])
        )
    //screw holes
    var screw_size = 3;
    mesh = difference(
                mesh,
                screwWood(screw_size,_wallThickness*2).rotateX(-90).translate([armlen/4,-thickness,_wallThickness/2])
            );
    return mesh;
}


/*function bearingsXY(side){
    var mesh;
    
    var Y = 20;  //width of bearings
    var Z = 28+thickness;
    var X = 51;
    var bearingsOffsetY = 3;
    var bearingsOffsetZ = 9;
    var bearingsOffsetX = 30+_wallThickness;
    var bearingHoleOffsetX = bearingsOffsetX+13;
    var topXOffset =0;
    var bottomXOffset= 0;
    if(side=="left"){
        topXOffset = 0;
    }
    if(side=="right"){
        bottomXOffset = 0;
    }
    mesh = difference(
        
        union(
            difference(
            //main
                union(
                    cube({size:[X,Y,Z]}).translate([thickness+_wallThickness,0,0])
                    // extra behind to touch the back plank
                    //cube({size:[thickness+_wallThickness+thickness,thickness,Z]}).translate([0,Y,0])
                    
                ),
            // support bearings
            cube({size:[X+10,Y,8]}).translate([bearingsOffsetX-bottomXOffset,0,bearingsOffsetZ]),
            cube({size:[X+10,Y,8]}).translate([bearingsOffsetX-topXOffset,0,bearingsOffsetZ+8+thickness])
            ),
            
            //extra for y rod
            //cylinder({r:_XYrodsDiam/2,h:12,fn:_globalResolution}).rotateX(90).translate([20,_nemaXYZ,4]),
            cylinder({r:_XYrodsDiam/2+thickness,h:Y,fn:_globalResolution}).rotateX(-90).translate([_wallThickness+20+thickness,0,1]),

            // round bearings supports in middle
            cylinder({r:5,h:0.5,fn:_globalResolution}).translate([bearingHoleOffsetX-bottomXOffset,Y/2,bearingsOffsetZ]),
            cylinder({r:5,h:0.5,fn:_globalResolution}).translate([bearingHoleOffsetX-bottomXOffset,Y/2,bearingsOffsetZ+7.5]),
            cylinder({r:5,h:0.5,fn:_globalResolution}).translate([bearingHoleOffsetX-topXOffset,Y/2,bearingsOffsetZ+8+thickness]),
            cylinder({r:5,h:0.5,fn:_globalResolution}).translate([bearingHoleOffsetX-topXOffset,Y/2,bearingsOffsetZ+8+thickness+7.5]),
            // central cube
            cube({size:[_wallThickness,_wallThickness,_wallThickness]}).translate([thickness, Y+thickness, 0]),
            //top wall
            linear_extrude({ height: thickness }, polygon({ points: [[0,0], [0, armlen], [_wallThickness+thickness*2, armlen], [armlen, _wallThickness+thickness*2], [armlen,0]] })).rotateX(180).translate([0, Y+thickness*2+_wallThickness, 2+_wallThickness+thickness]),
            //side wall
            linear_extrude({ height: thickness }, polygon({ points: [[0,0], [0, armlen], [_wallThickness+thickness*2, armlen], [armlen, _wallThickness+thickness*2], [armlen,0]] })).rotateX(-90).rotateZ(-90).translate([0, Y+thickness*2+_wallThickness, 2+_wallThickness+thickness]),
            //back wall
            linear_extrude({ height: thickness }, polygon({ points: [[0,0], [0, armlen], [_wallThickness+thickness*2, armlen], [armlen, _wallThickness+thickness*2], [armlen,0]] })).rotateX(-90).translate([0, Y+thickness*2+_wallThickness, 2+_wallThickness+thickness]),
            //socket walls
            //cube({size:[armlen-_wallThickness-thickness,thickness,_wallThickness+thickness]}).translate([thickness+_wallThickness, thickness+_wallThickness, thickness]),
            //cube({size:[armlen-_wallThickness-thickness,_wallThickness+thickness,thickness]}).translate([thickness+_wallThickness, thickness, thickness+_wallThickness]),
            //cube({size:[thickness,armlen-_wallThickness-thickness,_wallThickness+thickness]}).translate([thickness+_wallThickness, thickness+_wallThickness, thickness]),
            //cube({size:[_wallThickness+thickness,armlen-_wallThickness-thickness,thickness]}).translate([thickness, thickness+_wallThickness, thickness+_wallThickness]),
            //cube({size:[thickness,_wallThickness+thickness,armlen-_wallThickness-thickness]}).translate([thickness+_wallThickness, thickness, thickness+_wallThickness]),
            cube({size:[_wallThickness+thickness,thickness,armlen-_wallThickness-thickness]}).translate([thickness, Y+thickness, -armlen+_wallThickness+thickness])
        ),
        // Yrod
        cylinder({r:_XYrodsDiam/2,h:Y,fn:_globalResolution}).rotateX(-90).translate([_wallThickness+20+thickness,0,1]),
        
        // long bearing hole
        cylinder({r:4.1,h:40,fn:_globalResolution}).translate([bearingHoleOffsetX-bottomXOffset,Y/2,0]),
        // chamfreins Y
        roundBoolean2(3,Z,"tl").rotateX(-90).translate([X+_wallThickness,0,Z]),
        roundBoolean2(3,Z,"bl").rotateX(-90).translate([X+_wallThickness,Y-3,Z]),


        // wood support
        //cube({size:[_wallThickness,Y+5,17]}).translate([thickness,0,0]),
        // Y rod hole
        cylinder({r:_XYrodsDiam/2,h:12,fn:_globalResolution}).rotateX(-90).rotateZ(90).translate([20,-8,4])
        //round
        //roundBoolean2(10,Y+5,"br").translate([0,0,Z-10]),
        // xtra save material
        //cylinder({r:_XYrodsDiam,h:Y,fn:_globalResolution}).rotateX(-90).translate([27,0,20]),
        // wood screw holes
        //cylinder({r:2.1,h:20,fn:_globalResolution}).rotateX(-90).rotateZ(90).translate([12,4,5]),
        //cylinder({r:2.1,h:20,fn:_globalResolution}).rotateX(-90).rotateZ(90).translate([12,Y,5])

    );

	var screws = union(
		screwMetalNut(8,30).rotateX(180).translate([bearingHoleOffsetX-bottomXOffset,Y/2,50]),
		screwWood(4,13).rotateX(-90).rotateZ(-90).translate([-20,4,5]),
		screwWood(4,13).rotateX(-90).rotateZ(-90).translate([-20,Y,5])
	
	);
    //offsets
    //front/back offset
    if(_offsetFront>0){
        mesh = union(
            mesh,
            cube({size:[_offsetFront/2,_wallThickness,_wallThickness]}).translate([thickness+_wallThickness, Y+thickness*2, 2]).setColor(0.5,1,0.5)
        );
    }
    //side offset
    if(_offsetSide>0){
        mesh = union(
            mesh,
            cube({size:[_wallThickness,_offsetSide/2,_wallThickness]}).translate([thickness, Y+thickness*2-_offsetSide/2, 2]).setColor(0.5,1,0.5)
        );
    }
    //stand offset
    if(_offsetStand>0){
        mesh = union(
            mesh,
            cube({size:[_wallThickness,_wallThickness,_offsetStand/2]}).translate([thickness, Y+thickness*2, 2-_offsetStand/2]).setColor(0.5,1,0.5)
        );
    }
    if(side=="left"){
        mesh = union(
                mesh,
                text3d("L").scale(0.3).translate([20,10,Z])
        
                );
    }
    if(side=="right"){
        mesh = union(
                mesh,
                text3d("R").scale(0.3).rotateY(180).translate([20,10,Z+0.5])
                );
    }


    if(output==1){
        mesh = union(
                mesh,
                bearing608z().translate([bearingHoleOffsetX-bottomXOffset,Y/2,bearingsOffsetZ]),
                bearing608z().translate([bearingHoleOffsetX-topXOffset,Y/2,bearingsOffsetZ+11])
            );
    }
    
    if(output==14){
        mesh = union(
                mesh,
                bearing608z().translate([bearingHoleOffsetX-bottomXOffset,Y/2,bearingsOffsetZ]),
                bearing608z().translate([bearingHoleOffsetX-topXOffset,Y/2,bearingsOffsetZ+11]),
                screws
            );
    }
    return mesh;

}*/






// -------------------------------- extruder

function extruder(part){
    var X = 50;
    var Z = 9;
    var Y = 48; 
    var bearingoffsetX = 15.5;
    
    var jheadOffsetX = 3.5;
    //elastic part
    var epoffsetX = 5;
    var epoffsetY = 42;
    // this is to adjust how elastic will the bearing be.
    var elasticpartlength = 5;
    return difference(
        union(
            extruderPart(part,X,Y,Z),
            // extra support in case of bowden
            extruderSupport(part)
        ),
        nemaHole2().translate([0,2,-Z/2]),
        
        // 608 place 
        difference(
            cylinder({r:12,h:9,fn:_globalResolution}),
            cylinder({r:4,h:9,fn:_globalResolution}),
            cylinder({r:5,h:1,fn:_globalResolution}),
            cylinder({r:5,h:1,fn:_globalResolution}).translate([0,0,8])
        ).translate([bearingoffsetX,2,0]),
        // 608 screw hole to reinforce
        cylinder({r:1.6,h:10,fn:_globalResolution}).translate([bearingoffsetX,2,Z/2]),
        cylinder({r:1.35,h:10,fn:_globalResolution}).translate([bearingoffsetX,2,-Z/2]),
        // jhead or pressfit
        extruderOut(jheadOffsetX,Y,Z),
         
         // jhead holes or pressfit holes: 2 parts. up to pass screws, bottom to fix
         cylinder({r:1.6,h:10,fn:_globalResolution}).translate([jheadOffsetX-8,Y/2+1,Z/2]),
         cylinder({r:1.6,h:10,fn:_globalResolution}).translate([jheadOffsetX+8,Y/2+1,Z/2]),
         
         cylinder({r:1.35,h:10,fn:_globalResolution}).translate([jheadOffsetX-8,Y/2+1,-Z/2]),
         cylinder({r:1.35,h:10,fn:_globalResolution}).translate([jheadOffsetX+8,Y/2+1,-Z/2]),

         cylinder({r:1.6,h:10,fn:_globalResolution}).translate([jheadOffsetX-8,-Y/2+8,Z/2]),
         cylinder({r:1.35,h:10,fn:_globalResolution}).translate([jheadOffsetX-8,-Y/2+8,-Z/2]),
         

        // filament
        extruderFilament(jheadOffsetX,Y,Z),

        
        // elastic part with two holes
        cube({size:[2,epoffsetY,2*Z+1]}).translate([jheadOffsetX+epoffsetX,-Y/2,-Z/2]),
        cube({size:[elasticpartlength,2,2*Z+1]}).translate([jheadOffsetX+epoffsetX,-Y/2+epoffsetY,-Z/2]),
        // solidify corner
        cylinder({r:1.5,h:2*Z+2,fn:_globalResolution}).translate([elasticpartlength+7,-Y/2+epoffsetY+1,-Z/2]),

         // holes to add screw to maintain the iddle
         cylinder({r:1.6,h:15,fn:_globalResolution}).rotateY(-90).translate([X/2,-Y/2+10,9]),
         cylinder({r:1.6,h:15,fn:_globalResolution}).rotateY(-90).translate([X/2,-Y/2+10,0]),
         cylinder({r:1.35,h:15,fn:_globalResolution}).rotateY(-90).translate([X/2-15,-Y/2+10,9]),
         cylinder({r:1.35,h:15,fn:_globalResolution}).rotateY(-90).translate([X/2-15,-Y/2+10,0])
       
    )

}
function extruderPart(part,X,Y,Z){
    // lower part only
    if(part==0){
        return cube({size:[X,Y,Z],center:true}).translate([0,5,0])
    }
    // uppper part only
    else if(part==1){
        return cube({size:[X,Y,Z],center:true}).translate([0,5,Z+0.05])
    }
    else {
        return union(
            //main bottom
            cube({size:[X,Y,Z],center:true}).translate([0,5,0]),
            // main top
            cube({size:[X,Y,Z],center:true}).translate([0,5,Z+0.05])
        )
    }
}

function extruderSupport(part){
    var X = 20;
    var Z = 15;
    var Y = 9;
    if(part!=1){
        return difference(
                //main
                slottedHole(9,60,5).rotateY(-90).translate([-20,-20,0]),
                // screws for walls
                cylinder({r:2.1,h:10,fn:_globalResolution}).rotateY(-90).translate([-20,-20,0]),
                cylinder({r:2.1,h:10,fn:_globalResolution}).rotateY(-90).translate([-20,31,0])
            
        )
    }
    else{
        return cube(1)
    }
}

function extruderOut(jheadOffsetX,Y,Z){
    var jheadExtDiam = 15.5;
    var jheadIntDiam = 12.5;

        return union(

        cylinder({r:2.7,h:5,fn:_globalResolution}).rotateX(-90).translate([jheadOffsetX,Y/2,Z/2]),
        cylinder({r:2.7,h:5,fn:_globalResolution}).rotateX(-90).translate([jheadOffsetX,-Y/2+5,Z/2])

        )

}
function extruderFilament(jheadOffsetX,Y,Z){

        return union(
        cylinder({r:1,h:Y,fn:_globalResolution}).rotateX(-90).translate([jheadOffsetX,-Y/2,Z/2]),
        cylinder({r1:3,r2:1,h:5,fn:_globalResolution}).rotateX(-90).translate([jheadOffsetX,10,Z/2])
        )
}



function clipGlassBack(){
    var glassThickness = 3;
    var mesh = difference(
        cube({size:[18,18,5+glassThickness]}),
        cube({size:[14,14,glassThickness]}).translate([4,4,0]),
        cube({size:[10,10,5]}).translate([8,8,glassThickness]),
        cylinder({r1:1.6,r2:3,h:2,fn:_globalResolution}).translate([2.5,2.5,6]),
        cylinder({r:1.6,h:6,fn:_globalResolution}).translate([2.5,2.5,0])

    );
    mesh.properties.connect1 = new CSG.Connector([0,0, 0], [1, 0, 0], [0, 0, 1]);
    return mesh;
}

function clipGlassFront(){
    var glassThickness = 3;
    var bedSupportThickness = 10;
    var mesh = difference(
        cube({size:[20,8,bedSupportThickness+glassThickness+10]})
    )
    mesh.properties.connect1 = new CSG.Connector([0,0, 0], [1, 0, 0], [0, 0, 1]);
    return mesh;
}

function ramps() {

var vw = 2.5, r = 4*vw, height = 5.5, m3 = 1.5, larduino = 102, Larduino = 55, edge = 3, hedge = 2, ledge = 2;

return difference(

    union(

      cube({size:[larduino+edge/2,Larduino+edge,height]}),
      cylinder({r:r,h:height}).translate([(larduino+edge/2)/2,-r,0]),
      cube({size:[r*2,r,height]}).translate([((larduino+edge/2)-r*2)/2,-r,0]),
      cylinder({r:r,h:height}).translate([(larduino+edge/2)/4,Larduino+edge+r,0]),
      cube({size:[r*2,r,height]}).translate([((larduino+edge/2)/4)-r,Larduino+edge,0]),
      cylinder({r:r,h:height}).translate([(larduino+edge/2)*0.75,Larduino+edge+r,0]),
      cube({size:[r*2,r,height]}).translate([((larduino+edge/2)*0.75)-r,Larduino+edge,0])

      ),



    cube({size:[larduino,Larduino,height-hedge]}).translate([0,edge/2,0]),
    cube({size:[larduino-ledge+edge/2,Larduino-ledge ,height]}).translate([-ledge/2,edge/2+ledge/2,0]),
    cylinder({r:vw,h:height}).translate([(larduino+edge/2)/2,-r,0]),
    cylinder({r:vw,h:height}).translate([(larduino+edge/2)/4,Larduino+edge+r,0]),
    cylinder({r:vw,h:height}).translate([(larduino+edge/2)*0.75,Larduino+edge+r,0])
    
   );
}

function spoolholder() {

var  vw = 2,  rbase = 40, rspool = 23, hcenter=30, rayon3 = 30;

return difference(

    union(

      cylinder({r:rbase,h:thickness}), //base
      cylinder({r:rspool,h:hcenter}).translate([0,0,thickness]) //Spool
      
      ),

    cylinder({r:vw,h:100}),  //screw
  cylinder({r:rspool-4,h:100}).translate([0,0,thickness-2])  //hole


   );
}

function alim() {

var lalim=32, Lalim=52, sw=2, edge=15, height=8;

return difference(

    union(

      cube({size:[Lalim,thickness,height]}),
      cube({size:[lalim+thickness,thickness,height]}).rotateZ(90),
      cube({size:[edge,thickness,height]}).rotateZ(90).translate([Lalim+thickness,-edge+thickness,0]),
      cube({size:[edge,thickness,height]}).translate([-edge,lalim+thickness,0])
      
   

      ),

    
    cylinder({r:sw,h:20}).rotateX(90).translate([-sw-edge/2,Lalim,height/2]),
    cylinder({r:sw,h:20}).rotateY(90).translate([Lalim-thickness,sw-edge/2,height/2])
    
   );
}













//  ----------   non printed elements ------------

function fakeJhead(){
    return union(
        cylinder({r:2,h:15,fn:_globalResolution}),
        cube({size:[20,15,8],center:true}).translate([0,0,8]),
        cylinder({r:12.5,h:30,fn:_globalResolution}).translate([0,0,15]),
        cylinder({r:6,h:5,fn:_globalResolution}).translate([0,0,45]),
        cylinder({r:7.5,h:5,fn:_globalResolution}).translate([0,0,50])
        
    );
}

function fake_switch(){
    return cube([40,8,15]);
}

function _extrusionFrame(){
	
	var mesh = union(
	// front top
	cube({size:[_globalWidth,_ExtrusionSize,_ExtrusionSize],center:true}).translate([-_globalWidth/2,-_globalDepth/2,_globalHeight])
	
	);
	return mesh;
	
	
}

function _walls(){

     
     return union(
         //bottom frame
         cube({size:[_globalWidth-_offsetFront,_wallThickness,_wallThickness]}).translate([-_globalWidth/2+_offsetFront/2,-_globalDepth/2-_wallThickness,-_wallThickness]).setColor(0.5,0.5,0.5),   //bottom front
         cube({size:[_wallThickness,_globalDepth-_offsetSide,_wallThickness]}).translate([-_globalWidth/2-_wallThickness,-_globalDepth/2+_offsetSide/2,-_wallThickness]).setColor(0.5,0.5,0.5),   //bottom left
         cube({size:[_globalWidth-_offsetFront,_wallThickness,_wallThickness]}).translate([-_globalWidth/2+_offsetFront/2,_globalDepth/2,-_wallThickness]).setColor(0.5,0.5,0.5),   //bottom back
         cube({size:[_wallThickness,_globalDepth-_offsetSide,_wallThickness]}).translate([_globalWidth/2,-_globalDepth/2+_offsetSide/2,-_wallThickness]).setColor(0.5,0.5,0.5),   //bottom right
         
         //top frame
         cube({size:[_globalWidth-_offsetFront,_wallThickness,_wallThickness]}).translate([-_globalWidth/2+_offsetFront/2,-_globalDepth/2-_wallThickness,_globalHeight-_wallThickness]).setColor(0.5,0.5,0.5),  //top front
         cube({size:[_wallThickness,_globalDepth-_offsetSide,_wallThickness]}).translate([-_globalWidth/2-_wallThickness,-_globalDepth/2+_offsetSide/2,_globalHeight-_wallThickness]).setColor(0.5,0.5,0.5),  //top left
         cube({size:[_globalWidth-_offsetFront,_wallThickness,_wallThickness]}).translate([-_globalWidth/2+_offsetFront/2,_globalDepth/2,_globalHeight-_wallThickness]).setColor(0.5,0.5,0.5),  //top back
         cube({size:[_wallThickness,_globalDepth-_offsetSide,_wallThickness]}).translate([_globalWidth/2,-_globalDepth/2+_offsetSide/2,_globalHeight-_wallThickness]).setColor(0.5,0.5,0.5),  //top right
         
         //left frame
         cube({size:[_wallThickness,_wallThickness,_globalHeight-_wallThickness-_offsetStand]}).translate([-_globalWidth/2-_wallThickness,-_globalDepth/2-_wallThickness, _offsetStand/2]).setColor(0.5,0.5,0.5),  //left front
         cube({size:[_wallThickness,_wallThickness,_globalHeight-_wallThickness-_offsetStand]}).translate([-_globalWidth/2-_wallThickness,_globalDepth/2, _offsetStand/2]).setColor(0.5,0.5,0.5),   //left back
         
         //right frame
         cube({size:[_wallThickness,_wallThickness,_globalHeight-_wallThickness-_offsetStand]}).translate([_globalWidth/2,-_globalDepth/2-_wallThickness, _offsetStand/2]).setColor(0.5,0.5,0.5),  //right front
         cube({size:[_wallThickness,_wallThickness,_globalHeight-_wallThickness-_offsetStand]}).translate([_globalWidth/2,_globalDepth/2, _offsetStand/2]).setColor(0.5,0.5,0.5)   //right back
         );
}

function wallSizeText(){
    return union(
        // top/bottom frame sides 
        text3d("sides: 4 x "+(_globalDepth-_offsetSide) +" mm").scale(0.5).rotateX(90).rotateZ(-90).translate([-_globalWidth/2-_wallThickness-3,0,_wallThickness]).setColor(0.2,0.3,0.2),
        // stands
        text3d("stands: 4 x "+(_globalHeight-_offsetStand) +" mm").scale(0.5).rotateZ(90).rotateX(90).translate([_globalWidth/2-_wallThickness,-_globalDepth/2,_globalHeight/2-_wallThickness*2]).setColor(0.2,0.3,0.2),
        // top/bottom frame front/back 
        text3d("front/back: 4 x "+(_globalWidth-_offsetFront)+" mm").scale(0.5).translate([-_wallThickness,-_globalDepth/2,_wallThickness]).setColor(0.2,0.3,0.2)

    )
}
function _rodsXY() {
    var offsetFromTopY = 16;
    var offsetFromTopX = -5;
    return union(
        // rod X top
        cylinder({r:_XYrodsDiam/2,h:XrodLength,fn:_globalResolution}).rotateY(90).translate([-_globalWidth/2+50,XaxisOffset+10,_globalHeight-offsetFromTopX+14]).setColor(0.3,0.3,0.3),
        // rod x top bearing
        cylinder({r:_XYlmDiam/2,h:50,fn:_globalResolution}).rotateY(90).translate([headoffset,XaxisOffset+10,_globalHeight-offsetFromTopX+14]).setColor(0.6,0.6,0.6),
        // rod x bottom
        cylinder({r:_XYrodsDiam/2,h:XrodLength,fn:_globalResolution}).rotateY(90).translate([-_globalWidth/2+50,XaxisOffset+10,_globalHeight-offsetFromTopX-26]).setColor(0.3,0.3,0.3),
        // rod x bottom bearing
        cylinder({r:_XYlmDiam/2,h:50,fn:_globalResolution}).rotateY(90).translate([headoffset,XaxisOffset+10,_globalHeight-offsetFromTopX-26]).setColor(0.6,0.6,0.6),
        
        // rod y left
        cylinder({r:_XYrodsDiam/2,h:YrodLength,fn:_globalResolution}).rotateX(90).translate([-_globalWidth/2+20,_globalDepth/2-10+thickness,_globalHeight-offsetFromTopY]).setColor(0.3,0.3,0.3),
        // rod y left bearing
        cylinder({r:_XYlmDiam/2,h:50,fn:_globalResolution}).rotateX(90).translate([-_globalWidth/2+20,90,_globalHeight-offsetFromTopY]).setColor(0.6,0.6,0.6),
        // rod y right
        cylinder({r:_XYrodsDiam/2,h:YrodLength,fn:_globalResolution}).rotateX(90).translate([_globalWidth/2-20,_globalDepth/2-10+thickness,_globalHeight-offsetFromTopY]).setColor(0.3,0.3,0.3)
        );    
}

function _rodsZ() {
        return union(
            //rod Z left
            cylinder({r:_ZrodsDiam/2,h:ZrodLength,fn:_globalResolution}).translate([-_ZrodsWidth/2,_globalDepth/2+_wallThickness/2,0 ]).setColor(0.3,0.3,0.3),
            //rod Z left bearing
            cylinder({r:_ZlmDiam/2,h:50,fn:_globalResolution}).translate([-_ZrodsWidth/2,_globalDepth/2+_wallThickness/2,_globalHeight/2-40]).setColor(0.5,0.5,0.5),
            // rod z right
            cylinder({r:_ZrodsDiam/2,h:ZrodLength,fn:_globalResolution}).translate([_ZrodsWidth/2,_globalDepth/2+_wallThickness/2,0 ]).setColor(0.3,0.3,0.3),
            // rod z right bearing
            cylinder({r:_ZlmDiam/2,h:50,fn:_globalResolution}).translate([_ZrodsWidth/2,_globalDepth/2+_wallThickness/2,_globalHeight/2-40]).setColor(0.5,0.5,0.5)
            // support bed *4
            //cylinder({r:_ZrodsDiam/2,h:_printableDepth}).rotateX(90).translate([-_ZrodsWidth/2,_globalDepth/2-25,_globalHeight/2]).setColor(0.5,0.5,0.5),
            //cylinder({r:_ZrodsDiam/2,h:_printableDepth}).rotateX(90).translate([_ZrodsWidth/2,_globalDepth/2-25,_globalHeight/2]).setColor(0.5,0.5,0.5),
            //cylinder({r:_ZrodsDiam/2,h:_printableDepth}).rotateX(83).rotateZ(5).translate([-_ZrodsWidth/2,_globalDepth/2-25,_globalHeight/2-30]).setColor(0.5,0.5,0.5),
            //cylinder({r:_ZrodsDiam/2,h:_printableDepth}).rotateX(83).rotateZ(-5).translate([_ZrodsWidth/2,_globalDepth/2-25,_globalHeight/2-30]).setColor(0.5,0.5,0.5)
        );
}
function _rods() {
    return union(_rodsXY(),_rodsZ());       
}

function rodsLengthText(){
    var offsetFromTopY = 14;
    var offsetFromTopX = -5;
    return union(
    //x 
        text3d("rod X: "+XrodLength.toString()).scale(0.5).translate([-_globalWidth/2+55,XaxisOffset-10,_globalHeight-offsetFromTopX+5]).setColor(0.3,0.3,0.2),
        // y
        text3d("rod Y: "+YrodLength.toString()).scale(0.5).rotateZ(90).translate([-_globalWidth/2+20,_globalDepth/2-100,_globalHeight-offsetFromTopY+5]).setColor(0.3,0.3,0.2),
        // z
        text3d("rod Z: "+ZrodLength.toString()).scale(0.5).rotateX(90).translate([-_ZrodsWidth/2+10,_globalDepth/2-_wallThickness-10,_globalHeight/2-40]).setColor(0.3,0.3,0.2),
        // belt
        text3d("belt length xy: " + ((XrodLength + beltXAddon)*4 + (YrodLength + beltYAddon)*4)).scale(0.5).translate([-_globalWidth/2+55,XaxisOffset-50,_globalHeight-offsetFromTopX+5]).setColor(0.9,0.3,0.2)
        );

}




function _nema(){
    return union(
        cube({size:_nemaXYZ}).setColor(0.3,0.3,1.0),
        cylinder({r:11,h:2,fn:_globalResolution}).translate([_nemaXYZ/2,_nemaXYZ/2,_nemaXYZ]),
        cylinder({r:2.5,h:25,fn:_globalResolution}).translate([_nemaXYZ/2,_nemaXYZ/2,_nemaXYZ+2])
    );
}

function _bed(){
    var mesh = difference(
        cube({size:[_printableWidth/2,_printableDepth+30,3]}).setColor(0.8,0.8,0.4,0.5)

    );
    mesh.properties.clipbackleft = new CSG.Connector([0, _printableDepth, 0], [1, 0, 0], [0, 0, 1]);
    mesh.properties.clipbackright = new CSG.Connector([_printableWidth, _printableDepth, 0], [1, 0, 0], [0, 0, 1]);
    mesh.properties.clipfrontleft = new CSG.Connector([0,0, 0], [1, 0, 0], [0, 0, 1]);
    mesh.properties.clipfrontright = new CSG.Connector([_printableWidth,0, 0], [1, 0, 0], [0, 0, 1]);

    return mesh;
}









// -----------------------  lib
// screw metal m 
function screwMetal(diam,length){
    return union(
        cylinder({r:diam/2+1,h:3,fn:_globalResolution}),
        cylinder({r:diam/2,h:length,fn:_globalResolution}).translate([0,0,3])
    ).setColor(0.5,0.5,0.5,0.8)
}
// screw metal exa (big )
function screwMetalNut(diam,length){
    return union(
        cylinder({r:diam/2+2,h:5,fn:6}),
        cylinder({r:diam/2,h:length,fn:_globalResolution}).translate([0,0,5])
    ).setColor(0.5,0.5,0.5,0.8)
}
function screwWood(diam,length){
    return union(
        cylinder({r1:diam/2+2,r2:diam/2,h:3,fn:_globalResolution}),
        cylinder({r:diam/2,h:length,fn:_globalResolution}).translate([0,0,3])
    ).setColor(0.7,0.7,0.5,0.8)
}


function text3d(what){
    var l = vector_text(0,0,what);   
    var o = [];
    l.forEach(function(pl) {                   
    o.push(rectangular_extrude(pl, {w: 5, h: 2}));   
    });
    return union(o);
}

function tube(dint,dext,length){
    return difference(
            cylinder({r:dext/2,h:length,fn:_globalResolution}),
            cylinder({r:dint/2,h:length,fn:_globalResolution})
        );
}

function _axis(){
    return union(
        cube({size:[10,1,1]}).setColor(1,0,0),
        cube({size:[1,10,1]}).setColor(0,1,0),
        cube({size:[1,1,10]}).setColor(0,0,1)
        );
}

function nemaHole(){
    var offset = (_nemaXYZ==35)?13:15.5;
        return union(
            cylinder({r:11.3,h:40,fn:_globalResolution}),
            cylinder({r:1.6,h:40,fn:_globalResolution}).translate([-offset,-offset,0]),
            cylinder({r:1.6,h:40,fn:_globalResolution}).translate([offset,-offset,0]),
            cylinder({r:1.6,h:40,fn:_globalResolution}).translate([-offset,offset,0]),
            cylinder({r:1.6,h:40,fn:_globalResolution}).translate([offset,offset,0])
        );
}

// only 2 screw holes
function nemaHole2(){
    var offset = (_nemaXYZ==35)?13:15.5;
        return union(
            cylinder({r:11.3,h:40,fn:_globalResolution}),
            cylinder({r:1.6,h:40,fn:_globalResolution}).translate([-offset,-offset,0]),
            //cylinder({r:1.6,h:40,fn:_globalResolution}).translate([offset,-offset,0]),
            cylinder({r:1.6,h:40,fn:_globalResolution}).translate([-offset,offset,0])
            //cylinder({r:1.6,h:40,fn:_globalResolution}).translate([offset,offset,0])
        );
}

function slottedHole(diam,length,height){
    return union(
        cylinder({r:diam/2,h:height,fn:_globalResolution}),
        cube([diam,length-diam,height]).translate([-diam/2,0,0]),
        cylinder({r:diam/2,h:height,fn:_globalResolution}).translate([0,length-diam,0])
    );
}

function bearingSupport(baseHeight){
    return difference(
        union(
            cylinder({r:5,h:baseHeight,fn:_globalResolution}),
            cylinder({r:4,h:6,fn:_globalResolution}).translate([0,0,baseHeight])
        ),
        cylinder({r:1.4,h:baseHeight+7,fn:_globalResolution})
    );
}

function bearingSupport2(baseHeight){
    return difference(
        union(
            cylinder({r:5,h:baseHeight,fn:_globalResolution}),
            cylinder({r:4,h:16,fn:_globalResolution}).translate([0,0,baseHeight])
        ),
        cylinder({r:1.4,h:baseHeight+16,fn:_globalResolution})
    );
}

function bearingTop(hole){
    return difference(
        union(
            cylinder({r:5,h:1,fn:_globalResolution}),
            cylinder({r:13,h:1.5,fn:_globalResolution}).translate([0,0,1])
        ),
        cylinder({r:hole/2+0.1,h:6,fn:_globalResolution})
    );
}

function bearingMiddle(hole){
    return difference(
        union(
            cylinder({r:5,h:1,fn:_globalResolution}),
            cylinder({r:13,h:1,fn:_globalResolution}).translate([0,0,1])
        ),
        cylinder({r:hole/2+0.1,h:6,fn:_globalResolution})
    );
}

function bearing608z(){
    return difference(
        cylinder({r:11,h:7,fn:_globalResolution}).setColor(0.4,0.4,0.4),
        cylinder({r:4,h:7,fn:_globalResolution})
    );
}

function Gt2Holder(boolOffset,height){
    var h = 10;
    var beltThickness = 0.9;
    if(height){h=height;}
    return difference(
        linear_extrude({height:10},polygon({points:[[0,0],[16,0],[12,h],[4,h]]})).translate([-12,0,-h]).rotateY(-90).rotateX(90),
        union(
            cube([10,1,h-3]).translate([h-10,boolOffset,3]),
            cube([1,1,h-3]).translate([h-9,boolOffset+beltThickness,3]),
            cube([1,1,h-3]).translate([h-7,boolOffset+beltThickness,3]),
            cube([1,1,h-3]).translate([h-5,boolOffset+beltThickness,3]),
            cube([1,1,h-3]).translate([h-3,boolOffset+beltThickness,3]),
            cube([1,1,h-3]).translate([h-1,boolOffset+beltThickness,3])

        )
    )
}

function Gt2HolderSuspendedRight(boolOffset,height){
    var h = 10;
    var beltThickness = 0.9;
    if(height){h=height;}
    return difference(
        linear_extrude({height:10},polygon({points:[[0,0],[12,-h],[16,0],[12,h],[4,h]]})).translate([-12,0,-h]).rotateY(-90).rotateX(90),
        union(
            cube([10,1,h-3]).translate([h-10,boolOffset,3]),
            cube([1,1,h-3]).translate([h-9,boolOffset+beltThickness,3]),
            cube([1,1,h-3]).translate([h-7,boolOffset+beltThickness,3]),
            cube([1,1,h-3]).translate([h-5,boolOffset+beltThickness,3]),
            cube([1,1,h-3]).translate([h-3,boolOffset+beltThickness,3]),
            cube([1,1,h-3]).translate([h-1,boolOffset+beltThickness,3])

        )
    )
}

function Gt2HolderSuspendedLeft(boolOffset,height){
    var h = 10;
    var beltThickness = 0.9;
    if(height){h=height;}
    return difference(
        linear_extrude({height:10},polygon({points:[[0,0],[4,-h],[16,0],[12,h],[4,h]]})).translate([-12,0,-h]).rotateY(-90).rotateX(90),
        union(
            cube([10,1,h-3]).translate([h-10,boolOffset,3]),
            cube([1,1,h-3]).translate([h-9,boolOffset+beltThickness,3]),
            cube([1,1,h-3]).translate([h-7,boolOffset+beltThickness,3]),
            cube([1,1,h-3]).translate([h-5,boolOffset+beltThickness,3]),
            cube([1,1,h-3]).translate([h-3,boolOffset+beltThickness,3]),
            cube([1,1,h-3]).translate([h-1,boolOffset+beltThickness,3])

        )
    )
}

function Gt2HolderBool(boolOffset,height){
    var h = 10;
    var beltThickness = 0.9;
    if(height){h=height;}
    return union(
            cube([10,1,h-3]).translate([h-10,boolOffset,3]),
            cube([1,1,h-3]).translate([h-9,boolOffset+beltThickness,3]),
            cube([1,1,h-3]).translate([h-7,boolOffset+beltThickness,3]),
            cube([1,1,h-3]).translate([h-5,boolOffset+beltThickness,3]),
            cube([1,1,h-3]).translate([h-3,boolOffset+beltThickness,3]),
            cube([1,1,h-3]).translate([h-1,boolOffset+beltThickness,3])
        )
}

function Gt2Holder3(boolOffset,height){
    var h = 10;
    if(height){h=height;}
    return difference(
        linear_extrude({height:10},polygon({points:[[0,0],[16,0],[12,h],[4,h]]})).translate([-12,0,-h]).rotateY(-90).rotateX(90),
        union(
            cube([10,1,h-3]).translate([h-10,boolOffset,6]),
            cube([1,1,h-3]).translate([h-9,boolOffset+1,6]),
            cube([1,1,h-3]).translate([h-7,boolOffset+1,6]),
            cube([1,1,h-3]).translate([h-5,boolOffset+1,6]),
            cube([1,1,h-3]).translate([h-3,boolOffset+1,6]),
            cube([1,1,h-3]).translate([h-1,boolOffset+1,6])

        )
    )
}
function Gt2Holder2(){
    var beltThickness = 0.9;
    return difference(

        linear_extrude({height:23},polygon({points:[[0,0],[16,0],[12,10],[4,10]]})).translate([-12,0,-10]).rotateY(-90).rotateX(90),
        union(
            cube([23,1,7]).translate([-13,3,3]),
            cube([1,1,7]).translate([-11,3+beltThickness,3]),
            cube([1,1,7]).translate([-9,3+beltThickness,3]),
            cube([1,1,7]).translate([-7,3+beltThickness,3]),
            cube([1,1,7]).translate([-5,3+beltThickness,3]),
            cube([1,1,7]).translate([-3,3+beltThickness,3]),
            cube([1,1,7]).translate([-1,3+beltThickness,3]),
            cube([1,1,7]).translate([1,3+beltThickness,3]),
            cube([1,1,7]).translate([3,3+beltThickness,3]),
            cube([1,1,7]).translate([5,3+beltThickness,3]),
            cube([1,1,7]).translate([7,3+beltThickness,3]),
            cube([1,1,7]).translate([9,3+beltThickness,3]),
            cube([1,1,7]).translate([11,3+beltThickness,3])

        )
    )
}

function endstop_meca(){
    return difference(
        cube([40,15,7]),
        cylinder({r:1.5,h:8,fn:_globalResolution}).translate([2.5,2.5,0]),
        cylinder({r:1.5,h:8,fn:_globalResolution}).translate([2.5+14,2.5,0]),
        cylinder({r:1.5,h:8,fn:_globalResolution}).translate([40-2.5,2.5,0])

    );
}

function roundBoolean(diam,w,d,h,edge){
    var bool;
    if(edge=="bl"){bool = cylinder({r:diam/2,h:d,fn:_globalResolution}).rotateX(-90).translate([0,0,0]);}
    if(edge=="tl"){bool = cylinder({r:diam/2,h:d,fn:_globalResolution}).rotateX(-90).translate([0,0,h]);}
    if(edge=="br"){bool = cylinder({r:diam/2,h:d,fn:_globalResolution}).rotateX(-90).translate([w,0,0]);}
    if(edge=="tr"){bool = cylinder({r:diam/2,h:d,fn:_globalResolution}).rotateX(-90).translate([w,0,h]);}
    return difference(
        cube([w,d,h]),
        bool
    );
}

function roundBoolean2(diam,length,edge){
    var bool;
    if(edge=="bl"){bool = cylinder({r:diam,h:length,fn:_globalResolution}).rotateX(-90).translate([0,0,0]);}
    if(edge=="tl"){bool = cylinder({r:diam,h:length,fn:_globalResolution}).rotateX(-90).translate([0,0,diam]);}
    if(edge=="br"){bool = cylinder({r:diam,h:length,fn:_globalResolution}).rotateX(-90).translate([diam,0,0]);}
    if(edge=="tr"){bool = cylinder({r:diam,h:length,fn:_globalResolution}).rotateX(-90).translate([diam,0,diam]);}
    return difference(
        cube([diam,length,diam]),
        bool
    );
}

function roundedCube(X, Y, Z, radius)
{
    var h = hull(
                circle({r: radius, center: true, fn:_globalResolution}).translate([radius, radius, 0]),
                circle({r: radius, center: true, fn:_globalResolution}).translate([X-radius, radius, 0]),
                circle({r: radius, center: true, fn:_globalResolution}).translate([X-radius, Y-radius, 0]),
                circle({r: radius, center: true, fn:_globalResolution}).translate([radius, Y-radius, 0])
        );
    return linear_extrude({ height: Z }, h);
}

// align parts so they are on z=0 and no touching
function makeplate(parts){
    var deltaX = 5;
    var deltaY = 5;
    var oldbox;
    var i;
    var currentX = -100;
    var currentY = -100;
    var nextY = 0;
    var maxX = 100;
    var maxY = 100;
    var currentPlate = 0;
    for(i =0;i < parts.length;i++){
        var box = parts[i].getBounds();
        var nextX = currentX + (box[1].x-box[0].x)+deltaX;
        if(nextX > maxX){
            currentX = -100;
            currentY = currentY + nextY + deltaY;
            nextY = 0;
        }
        
        parts[i] = parts[i].translate([currentX-box[0].x+deltaX,currentY-box[0].y+deltaY,-box[0].z]);
        currentX = currentX + (box[1].x-box[0].x)+deltaX ;
        nextY = Math.max(nextY,(box[1].y-box[0].y));
    }
    return parts;
}





// -----------------------  start here 

function main(params){

    // -------- sandbox ------- 
    //return _walls();
    //var infos = document.getElementById("dimensionsInfos");
    //infos.innerHTML = "hello there";


    // assign globals from interface parameters
    _printableWidth=params._printableWidth; 
    _printableHeight=params._printableHeight; 
    _printableDepth=params._printableDepth; 
    _wallThickness=params._wallThickness+params._offsetWall/10; 
    _XYrodsDiam = params._XYrodsDiam;
    _ZrodsDiam = params._ZrodsDiam;
    _globalResolution = params._globalResolution;
    _nemaXYZ=parseInt(params._nemaXYZ);
    _offsetFront=params._offsetFront;
    _offsetSide=params._offsetSide;
    _offsetStand=params._offsetStand;
    output=parseInt(params._output); 
    // update calculated values 
    if(_XYrodsDiam==6){ _XYlmDiam = 12.2;_XYlmLength = 19.1;}
    if(_XYrodsDiam==8){ _XYlmDiam = 15.2;_XYlmLength =24.1;}
    if(_ZrodsDiam==6){ _ZlmDiam = 12.2;}
    if(_ZrodsDiam==8){ _ZlmDiam = 15.2;}
    if(_ZrodsDiam==10){ _ZlmDiam = 19.2;}
    if(_ZrodsDiam==12){ _ZlmDiam = 21.2;}


    _globalDepth = _printableDepth + 110; // = motor support depth + bearings depth + head depth /2
    _globalWidth = _printableWidth + 165; // = motor uspport width + bearings width + head width /2
    _globalHeight = _printableHeight + 140; // bottom = 40mm head = 40 mm + extra loose.

    XrodLength = _printableWidth + 65; // 40: slideY width , 3: offset slideY from wall.
    YrodLength = _printableDepth + 65; // 5: rod support inside parts.
    ZrodLength = _printableHeight + 123;


    echo("wood depth:"+_globalDepth + " width:"+_globalWidth+" height:"+_globalHeight);
    echo("X rod length:"+XrodLength + " Y rod length:"+YrodLength+" Zrodlength:"+ZrodLength);
    // calculate some usefull vars
    var ztopbottomX = (_ZrodsWidth+_ZrodsDiam+(_rodsSupportThickness*2))/2;
    var zslideX = (_ZrodsWidth+_ZlmDiam+(_rodsSupportThickness*2))/2;

    
    
var res=null;


switch(output){
    case 0:
    // connections
        /*var bed = _bed().translate([-_printableWidth/2,-_printableDepth/2+35,_globalHeight/2+10]); 
        var clipGlassBackleft = clipGlassBack();
        var clipGlassBackright = clipGlassBack();
        var clipGlassFrontLeft = clipGlassFront();
        var clipGlassFrontRight = clipGlassFront();
        clipGlassBackleft = clipGlassBackleft.connectTo(clipGlassBackleft.properties.connect1,bed.properties.clipbackleft,false,0);
        clipGlassBackright = clipGlassBackright.connectTo(clipGlassBackright.properties.connect1,bed.properties.clipbackright,true,0);
        clipGlassFrontLeft = clipGlassFrontLeft.connectTo(clipGlassFrontLeft.properties.connect1,bed.properties.clipfrontleft,false,0);
        clipGlassFrontRight = clipGlassFrontRight.connectTo(clipGlassFrontRight.properties.connect1,bed.properties.clipfrontright,true,0);
*/
        res = [  ];

    break;
    case 1:
        
        res = [
            _walls(),
            _rods(),
            //ruler().rotateZ(90).translate([-_globalWidth/2+39,-_globalDepth/2+thickness,_globalHeight]),
            
            //nema left
            _nema().translate([-_globalWidth/2,-_globalDepth/2+thickness,_globalHeight-_nemaXYZ-20]),
            // nema right
            _nema().translate([_globalWidth/2-_nemaXYZ,-_globalDepth/2+thickness,_globalHeight-_nemaXYZ-20]),
            //motors
            motorXY("left").translate([-_globalWidth/2,-_globalDepth/2+thickness,_globalHeight-20]),
            motorXY("right").mirroredX().translate([_globalWidth/2,-_globalDepth/2+thickness,_globalHeight-20]),
            //corners
            cornerLR("left").translate([-_globalWidth/2-_wallThickness-thickness,-_globalDepth/2-_wallThickness-thickness,-_wallThickness-thickness]),
            cornerLR("right").mirroredX().translate([_globalWidth/2+_wallThickness+thickness,-_globalDepth/2-_wallThickness-thickness,-_wallThickness-thickness]),
            cornerLR("left").rotateZ(180).translate([_globalWidth/2+_wallThickness+thickness,_globalDepth/2+_wallThickness+thickness,-_wallThickness-thickness]),
            cornerLR("right").mirroredX().rotateZ(180).translate([-_globalWidth/2-_wallThickness-thickness,_globalDepth/2+_wallThickness+thickness,-_wallThickness-thickness]),
            //bearings
            bearingsXY("left").rotateZ(-90).translate([-_globalWidth/2-_wallThickness,_globalDepth/2+_wallThickness,_globalHeight-_wallThickness]),
            bearingsXY("right").mirroredX().rotateZ(90).translate([_globalWidth/2+_wallThickness,_globalDepth/2+_wallThickness,_globalHeight-_wallThickness]),
            //slides
            slideY("left").translate([-_globalWidth/2+6,XaxisOffset,_globalHeight-21]),
            slideY("right").mirroredX().translate([_globalWidth/2-6,XaxisOffset,_globalHeight-21]),
            //endstop x
            endstop_meca().rotateZ(-90).translate([headoffset,XaxisOffset+35,_globalHeight-39]),
            //endstop y
            endstop_meca().rotateY(-90).rotateZ(180).translate([_globalWidth/2-_wallThickness+2,-_globalDepth/2+_nemaXYZ+30,_globalHeight-52]),
            
            head().translate([headoffset,XaxisOffset,_globalHeight-36]),
            //ramps().rotateX(90).rotateZ(90).rotateY(180).translate([_globalWidth/2,-_globalDepth/2,100]),
            //spoolholder(),
            //alim().rotateY(90).rotateZ(90).translate([-_globalWidth/2+42,0,57])
            ];
            
            // Z stage 
            res.push(_nema().translate([-_nemaXYZ/2,_globalDepth/2-_nemaXYZ,-_wallThickness-thickness]));
            res.push(zTop().translate([0,_globalDepth/2+_wallThickness/2,_globalHeight-_wallThickness/2])); // 12 = ztop depth/2
            res.push(zBottom().translate([0,_globalDepth/2+_wallThickness/2,-_wallThickness+8])); //11= zbottom depth/2
            res.push(slideZ2().translate([-_ZrodsWidth/2,_globalDepth/2+_wallThickness/2,_globalHeight/2-40]));  
            res.push(_bed().translate([-_printableWidth/4,-_printableDepth/2,_globalHeight/2+10]));
          

            res.push(HeadSupportJhead().rotateZ(180).translate([headoffset+44,XaxisOffset,_globalHeight-14]));
            res.push(fakeJhead().translate([headoffset+23,XaxisOffset-15,_globalHeight-32]));
            // fake inductive sensor
            res.push(cylinder({r:9,h:70,fn:_globalResolution}).translate([headoffset+62,XaxisOffset-15,_globalHeight-40]));
            res.push(InductiveSensorSupport().translate([headoffset+1.5,XaxisOffset-30,_globalHeight+13]));
            
            // nema extruder
            res.push(_nema().rotateX(90).rotateZ(180).translate([_globalWidth/2,-_globalDepth/2,_globalHeight-_nemaXYZ-65]));
            res.push(extruder().rotateX(90).rotateZ(180).translate([_globalWidth/2-25,-_globalDepth/2+50,_globalHeight-90]));



    break;
    case 2:

        res = [

            motorXY("left").rotateX(-90),
            motorXY("right").mirroredX().rotateX(-90),
            
            cornerLR("left").rotateX(-90),
            cornerLR("right").mirroredX().rotateX(-90),

            bearingsXY("left").rotateX(90),
            bearingsXY("right").mirroredX().rotateX(90),

            slideY("left").rotateX(-90),
            slideY("right").mirroredX().rotateX(-90),

            head(),

            zTop(),
            zBottom(),
            slideZ2().rotateX(180),
            //ramps().rotateX(180),
            //spoolholder(),
            //alim()
            
                ];

            res.push(InductiveSensorSupport().rotateX(90));
            res.push(HeadSupportJhead().rotateX(90));
            // nema extruder
            res.push(extruder(0));
            res.push(extruder(1).rotateX(180));

            res = makeplate(res);

    break;
    case 3:
        res = [
        motorXY("left").translate([-_globalWidth/2,-_globalDepth/2,_globalHeight-20]).setColor(0.3,0.9,0.3),
            motorXY("right").mirroredX().translate([_globalWidth/2,-_globalDepth/2,_globalHeight-20]).setColor(0.3,0.9,0.3),
            bearingsXY("left").translate([-_globalWidth/2-_wallThickness-5,_globalDepth/2-26,_globalHeight-17]).setColor(0.3,0.9,0.3),
            bearingsXY("right").mirroredX().translate([_globalWidth/2+_wallThickness+5,_globalDepth/2-26,_globalHeight-17]).setColor(0.3,0.9,0.3),
            
            slideY("left").translate([-_globalWidth/2+6,XaxisOffset,_globalHeight-21]).setColor(0.3,0.9,0.3),
            slideY("right").mirroredX().translate([_globalWidth/2-6,XaxisOffset,_globalHeight-21]).setColor(0.3,0.9,0.3),
            
            head().translate([headoffset,XaxisOffset,_globalHeight-36]).setColor(0.3,0.9,0.3)
            ];
            
            // Z stage 
            res.push(zTop().translate([0,_globalDepth/2-12,_globalHeight-35]).setColor(0.3,0.9,0.3)); // 12 = ztop depth/2
            res.push(zBottom().translate([0,_globalDepth/2-11,_wallThickness]).setColor(0.3,0.9,0.3)); //11= zbottom depth/2
            res.push(slideZ2().translate([-_ZrodsWidth/2,_globalDepth/2-_wallThickness-2,_globalHeight/2-40]).setColor(0.3,0.9,0.3));  
            

            res.push(HeadSupportJhead().rotateZ(180).translate([headoffset+44,XaxisOffset,_globalHeight-14]).setColor(0.3,0.9,0.3));
            //res.push(cylinder({r:9,h:70,fn:_globalResolution}).translate([headoffset+57,XaxisOffset-15,_globalHeight-40]).setColor(0.2,0.2,0.2));
            res.push(InductiveSensorSupport().translate([headoffset+2,XaxisOffset-30,_globalHeight+13]).setColor(0.3,0.9,0.3));
            res.push(extruder().rotateX(90).rotateZ(180).translate([_globalWidth/2-25,-_globalDepth/2+50,_globalHeight-90]));


    break;
    case 4:
        res = [
            wallSizeText(),
            _walls(),
            rodsLengthText(),
            _rods()
        ];
    break;
    case 5:
        res = [motorXY("left"), motorXY("right").mirroredX().translate([-50,0,0])];
    break;
    case 6:
        res = [bearingsXY("left")]; //,bearingsXY("right").mirroredX().translate([-40,0,0]) ];
    break;
    case 7:
        res = [slideY("left").setColor(0.3,0.9,0.3), slideY("right").mirroredX().translate([-10,0,0])];
    break;
    case 8:
        res = [zTop(), zBottom().translate([0,0,-100])];
    break;
    case 9:
        res = zBottom();
    break;
    case 10:
        res = [
        slideZ2()
            ];
    break;
    case 11:
        res = [head(),HeadSupportJhead().rotateZ(180).translate([45,-1,22]),InductiveSensorSupport().translate([0,-50,0])];
    break;
    case 12:
        res = [ extruder(0),extruder(1).rotateX(180).translate([60,0,0])
        ];
    break;
    
    case 13:
		res = [];
        res.push(_nema().rotateX(-90).translate([-_nemaXYZ/2,_globalDepth/2-_wallThickness-_nemaXYZ-25,_nemaXYZ]));
		res.push(zTop().translate([0,_globalDepth/2-12,_globalHeight-35])); // 12 = ztop depth/2
		res.push(zBottom().translate([0,_globalDepth/2-11,5])); //11= zbottom depth/2
		res.push(slideZ2().translate([-_ZrodsWidth/2,_globalDepth/2-_wallThickness-2,_globalHeight/2-40]));  
		res.push(_bed().translate([-_printableWidth/4,-_printableDepth/2,_globalHeight/2+10]));
    break;
    
    case 14:
		res = [
		motorXY("left").translate([-_globalWidth/2,-_globalDepth/2,_globalHeight-20]),
		motorXY("right").mirroredX().translate([_globalWidth/2,-_globalDepth/2,_globalHeight-20]),
		bearingsXY("left").translate([-_globalWidth/2-_wallThickness-5,_globalDepth/2-26,_globalHeight-17]),
		bearingsXY("right").mirroredX().translate([_globalWidth/2+_wallThickness+5,_globalDepth/2-26,_globalHeight-17]),
		slideY("left").translate([-_globalWidth/2+6,XaxisOffset,_globalHeight-21]),
		slideY("right").mirroredX().translate([_globalWidth/2-6,XaxisOffset,_globalHeight-21]),
		//endstop x
		endstop_meca().rotateZ(-90).translate([headoffset,XaxisOffset+35,_globalHeight-39]),
		//endstop y
		endstop_meca().rotateY(-90).rotateZ(180).translate([_globalWidth/2-_wallThickness+2,-_globalDepth/2+_nemaXYZ+30,_globalHeight-52]),
		head().translate([headoffset,XaxisOffset,_globalHeight-36])
		];
     break;
    case 15:
		res=[
			zTop().translate([0,_globalDepth/2-12,_globalHeight-35]),
			slideZ2().translate([-_ZrodsWidth/2,_globalDepth/2-_wallThickness-2,_globalHeight/2-40]),
			zBottom().translate([0,_globalDepth/2-11,5]),
			
			slideY("left").translate([-_globalWidth/2+6,XaxisOffset,_globalHeight-21]),
			slideY("right").mirroredX().translate([_globalWidth/2-6,XaxisOffset,_globalHeight-21]),
			head().translate([headoffset,XaxisOffset,_globalHeight-36])
		];
	 break;
    case 16:
        res = [cornerLR("left")/*,cornerLR("right").mirroredX().translate([-50,0,0])*/];
    break;
    case 17:
        res = test_slot();
    default:
    break;
}

return res;


}




